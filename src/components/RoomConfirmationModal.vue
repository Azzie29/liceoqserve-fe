
<script setup>
import { computed } from 'vue'

const props = defineProps({
  show: Boolean,
  room: {
    type: Object,
    default: null,
  },
  action: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['close', 'confirm'])

const confirmation = computed(() => {
  const options = {
    'check-in': {
      title: 'Confirm Room Check-In?',
      message: 'Confirm that this group has arrived and is using the discussion room.',
      button: 'Confirm Check-In',
      danger: false,
    },
    expired: {
      title: 'Expired Reservation?',
      message: 'No one arrived within the given 15-minute grace period. Mark the reservation expired and make the room available to other students.',
      button: 'Mark Expired',
      danger: true,
    },
    'end-use': {
      title: 'Time’s up?',
      message: 'End the use of this room and make it available for other students.',
      button: 'Confirm End of Use',
      danger: false,
    },
  }

  return options[props.action] || options['check-in']
})
</script>

<template>
  <div
    v-if="show && room"
    class="overlay"
    @click.self="emit('close')"
  >
    <section
      class="confirmation-modal"
      role="dialog"
      aria-modal="true"
      :aria-label="confirmation.title"
    >
      <div class="heading">
        <div class="warning-icon">!</div>
        <h2>{{ confirmation.title }}</h2>
      </div>

      <p class="message">
        {{ confirmation.message }}
      </p>

      <p class="room-name">{{ room.name }}</p>

      <div class="actions">
        <button class="back-button" @click="emit('close')">
          Go Back
        </button>

        <button
          class="confirm-button"
          :class="{ danger: confirmation.danger }"
          @click="emit('confirm')"
        >
          {{ confirmation.button }}
        </button>
      </div>
    </section>
  </div>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  z-index: 1100;
  display: grid;
  place-items: center;
  padding: 20px;
  background: rgb(0 0 0 / 45%);
}

.confirmation-modal {
  width: min(100%, 390px);
  padding: 20px;
  border-radius: 13px;
  background: #f8eeee;
  color: #390607;
  box-shadow: 0 8px 30px rgb(0 0 0 / 20%);
}

.heading {
  display: flex;
  align-items: center;
  gap: 12px;
}

.warning-icon {
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  flex-shrink: 0;
  border-radius: 10px;
  background: #e5c5c5;
  color: #790b13;
  font-size: 25px;
  font-weight: bold;
}

h2 {
  margin: 0;
  font: 22px Georgia, serif;
}

.message {
  margin: 14px 0 8px;
  font-size: 12px;
  line-height: 1.5;
}

.room-name {
  margin: 8px 0 18px;
  color: #765456;
  font-size: 11px;
}

.actions {
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 8px;
}

button {
  min-height: 35px;
  padding: 0 14px;
  border: 1px solid #95686a;
  border-radius: 10px;
  background: transparent;
  color: #390607;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
}

.confirm-button {
  border-color: #650b12;
  background: #650b12;
  color: white;
}

.confirm-button.danger {
  border-color: #d00000;
  background: #d00000;
}
</style>
