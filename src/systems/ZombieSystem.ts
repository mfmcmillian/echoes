/**
 * Zombie AI System for Neural Collapse
 * Handles zombie movement, pathfinding, and attacks
 */

import { engine, Transform, Animator, Entity } from "@dcl/sdk/ecs";
import { Vector3, Quaternion } from "@dcl/sdk/math";
import {
  Zombie,
  Health,
  DyingZombie,
  GameState,
  AnimationState,
} from "../components/GameComponents";
import { gameStateEntity, getGamePhase, isPaused } from "../core/GameState";
import { playZombieAttackSound } from "../audio/SoundManager";
import { showGameOver } from "../core/GameController";

// Track zombie attack cooldowns and active sounds
const zombieAttackCooldowns = new Map<number, number>();
const activeZombieAttackSounds = new Map<number, number>();

/**
 * Zombie AI System - handles movement and attacks
 */
export function zombieSystem(dt: number) {
  if (getGamePhase() !== "playing") return;
  if (isPaused()) return;

  const playerTransform = Transform.getOrNull(engine.PlayerEntity);
  if (!playerTransform) return;

  const playerPosition = playerTransform.position;
  const playerHealth = Health.getMutableOrNull(engine.PlayerEntity);
  if (!playerHealth) return;

  const gameState = GameState.get(gameStateEntity);
  const baseSpeed = 0.5 + gameState.currentWave * 0.2;

  for (const [entity, zombie, transform] of engine.getEntitiesWith(
    Zombie,
    Transform
  )) {
    // Skip if zombie is dying
    if (DyingZombie.getOrNull(entity)) continue;

    const mutableTransform = Transform.getMutable(entity);

    // Calculate direction to player
    const direction = Vector3.create(
      playerPosition.x - mutableTransform.position.x,
      0,
      playerPosition.z - mutableTransform.position.z
    );
    const distance = Vector3.length(direction);

    // Get zombie speed from component
    const zombieSpeed = zombie.speed || baseSpeed;

    const animState = AnimationState.getOrNull(entity);
    if (!animState) continue;

    if (distance > 1.5) {
      // Movement logic
      const normalizedDirection = Vector3.scale(direction, 1 / distance);
      const newPosition = Vector3.add(
        mutableTransform.position,
        Vector3.scale(normalizedDirection, zombieSpeed * dt)
      );

      mutableTransform.position = newPosition;
      mutableTransform.rotation = Quaternion.lookRotation(
        normalizedDirection,
        Vector3.Up()
      );

      // Switch back to movement animation if currently attacking
      if (animState.currentClip === "attack") {
        const movementClip = animState.nextClip || "walk";
        const moveAnim = Animator.getClip(entity, movementClip);
        const attackAnim = Animator.getClip(entity, "attack");

        attackAnim.playing = false;
        attackAnim.weight = 0;
        moveAnim.playing = true;
        moveAnim.weight = 1;

        AnimationState.getMutable(entity).currentClip = movementClip;
      }
    } else {
      // Switch to attack animation only if not already attacking
      if (animState.currentClip !== "attack") {
        const movementClip = animState.nextClip || "walk";
        const attackAnim = Animator.getClip(entity, "attack");
        const moveAnim = Animator.getClip(entity, movementClip);

        moveAnim.playing = false;
        moveAnim.weight = 0;
        attackAnim.playing = true;
        attackAnim.weight = 1;

        AnimationState.getMutable(entity).currentClip = "attack";
      }

      const lastAttackTime = zombieAttackCooldowns.get(entity) || 0;
      const currentTime = Date.now();
      const attackCooldown = 1000; // 1 second between attacks

      if (currentTime - lastAttackTime >= attackCooldown) {
        // Deal damage to player
        playerHealth.current -= zombie.damage;
        playerHealth.lastDamageTime = currentTime;

        console.log(
          `Zombie ${entity} attacking, player health: ${playerHealth.current}`
        );

        // Play attack sound - only if this zombie doesn't already have one playing
        if (!activeZombieAttackSounds.has(entity)) {
          const soundEntity = playZombieAttackSound(mutableTransform.position);
          activeZombieAttackSounds.set(entity, soundEntity);
          console.log(`Playing attack sound for zombie ${entity}`);
        }

        // Update zombie's last attack time
        zombieAttackCooldowns.set(entity, currentTime);

        // Check for game over
        if (playerHealth.current <= 0) {
          console.log("Player died! Showing game over...");
          showGameOver();
        }
      }
    }
  }
}

/**
 * Dying Zombie System - handles zombie death animations
 */
export function dyingZombieSystem(dt: number) {
  const currentTime = Date.now();
  const deathAnimationDuration = 2000; // 2 seconds

  for (const [entity, dyingZombie] of engine.getEntitiesWith(
    DyingZombie,
    Animator
  )) {
    const animator = Animator.get(entity);
    const dieClip = animator.states.find((state) => state.clip === "die");

    if (!dieClip) continue;

    // Ensure die animation is playing
    if (!dieClip.playing) {
      Animator.playSingleAnimation(entity, "die", true);
    }

    // Remove zombie after death animation completes
    if (currentTime - dyingZombie.deathStartTime >= deathAnimationDuration) {
      console.log(`Removing zombie ${entity} after die animation`);
      Animator.stopAllAnimations(entity, true);
      engine.removeEntity(entity);
    }
  }
}

/**
 * Clean up zombie sounds when zombie is removed
 */
export function cleanupZombieSounds(entity: Entity) {
  activeZombieAttackSounds.delete(entity);
  zombieAttackCooldowns.delete(entity);
}
