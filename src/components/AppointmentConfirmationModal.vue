
<script setup>
defineProps({
  show: Boolean,
  action: {
    type: String,
    default: 'complete',
  },
  appointment: {
    type: Object,
    default: () => ({}),
  },
})

const emit = defineEmits(['close', 'confirm'])

const details = {
  complete: {
    title: 'Complete this Appointment?',
    button: 'Confirm completed',
    color: '#650b12',
  },
  cancel: {
    title: 'Cancel this Appointment?',
    button: 'Confirm cancelled',
    color: '#d00000',
  },
  'no-show': {
    title: 'No-show this Appointment?',
    button: 'Confirm no-show',
    color: '#d00000',
  },
}
</script>

<template>
  <div
    v-if="show"
    class="modal-overlay"
    @click.self="emit('close')"
  >
    <section
      class="modal"
      role="dialog"
      aria-modal="true"
      :aria-label="details[action]?.title"
    >
      <div class="heading">
        <div class="warning">!</div>
        <h2>{{ details[action]?.title }}</h2>
      </div>

      <p class="description">
        {{ appointment.student }} · {{ appointment.purpose }}
        · {{ appointment.date }} at {{ appointment.time }}
      </p>

      <div class="buttons">
        <button class="back" @click="emit('close')">
          Go Back
        </button>

        <button
          class="confirm"
          :style="{ background: details[action]?.color }"
          @click="emit('confirm', action)"
        >
          {{ details[action]?.button }}
        </button>
      </div>
    </section>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: grid;
  place-items: center;
  padding: 20px;
  background: rgb(0 0 0 / 45%);
}

.modal {
  width: min(100%, 460px);
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

.warning {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 54px;
  height: 54px;
  border-radius: 11px;
  background: #efc6c8;
  color: #790b13;
  font-size: 28px;
  font-weight: bold;
}

h2 {
  margin: 0;
  font: 500 23px Georgia, serif;
}

.description {
  margin: 17px 0;
  font-size: 12px;
  line-height: 1.6;
}

.buttons {
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 8px;
}

.buttons button {
  min-height: 36px;
  padding: 0 16px;
  border: 1px solid #6b3337;
  border-radius: 12px;
  background: transparent;
  color: #390607;
  font-weight: 600;
  cursor: pointer;
}

.buttons .confirm {
  border-color: transparent;
  color: white;
}

@media (max-width: 480px) {
  h2 {
    font-size: 19px;
  }
}
</style>
