
<script setup>
defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    default: 'Pending',
  },
})

defineEmits(['confirm', 'cancel'])
</script>

<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="modal-overlay"
      @click.self="$emit('cancel')"
      @keydown.esc="$emit('cancel')"
    >
      <section
        class="confirmation-modal"
        role="dialog"
        aria-modal="true"
        :aria-label="`Change status to ${status}?`"
      >
        <div class="warning-icon">!</div>

        <div class="modal-content">
          <h2>Change Status to {{ status }}?</h2>

          <p>
            The request timeline will update and the student
            will receive a notification.
          </p>

          <div class="modal-actions">
            <button
              class="back-button"
              @click="$emit('cancel')"
            >
              Go Back
            </button>

            <button
              class="confirm-button"
              @click="$emit('confirm')"
            >
              Confirm status change
            </button>
          </div>
        </div>
      </section>
    </div>
  </Teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgb(25 18 18 / 48%);
}

.confirmation-modal {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  width: min(100%, 450px);
  padding: 22px;
  border-radius: 12px;
  background: #f8eeee;
  color: #390607;
  box-shadow: 0 12px 40px rgb(0 0 0 / 18%);
}

.warning-icon {
  display: grid;
  flex-shrink: 0;
  width: 38px;
  height: 38px;
  place-items: center;
  border-radius: 10px;
  background: #ead1d1;
  color: #760f16;
  font-size: 25px;
  font-weight: 700;
}

.modal-content {
  flex: 1;
  min-width: 0;
}

h2 {
  margin: 4px 0 12px;
  font-family: Georgia, serif;
  font-size: 19px;
}

p {
  margin: 0;
  font-size: 12px;
  line-height: 1.5;
}

.modal-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 20px;
}

button {
  padding: 9px 12px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 11px;
}

.back-button {
  border: 1px solid #bda0a0;
  background: transparent;
  color: #390607;
}

.confirm-button {
  border: 1px solid #56090d;
  background: #56090d;
  color: white;
}

@media (max-width: 450px) {
  .confirmation-modal {
    padding: 16px;
    gap: 10px;
  }

  .modal-actions {
    flex-direction: column;
  }

  .modal-actions button {
    width: 100%;
  }
}
</style>
