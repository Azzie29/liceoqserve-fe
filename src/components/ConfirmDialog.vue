
<script setup>
defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: 'Confirm this action?'
  },
  message: {
    type: String,
    default: ''
  },
  confirmText: {
    type: String,
    default: 'Confirm'
  },
  danger: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['confirm', 'close'])
</script>

<template>
  <Teleport to="body">
    <div
      v-if="visible"
      class="modal-overlay"
      @click.self="emit('close')"
      @keydown.esc="emit('close')"
    >
      <section
        class="modal-card"
        role="dialog"
        aria-modal="true"
        :aria-label="title"
      >
        <div class="modal-heading">
          <div class="modal-icon" :class="{ warning: danger }">!</div>
          <h2>{{ title }}</h2>
        </div>

        <p class="modal-message">{{ message }}</p>

        <div class="modal-actions">
          <button
            class="back-button"
            type="button"
            @click="emit('close')"
          >
            Go Back
          </button>

          <button
            class="confirm-button"
            :class="{ danger }"
            type="button"
            @click="emit('confirm')"
          >
            {{ confirmText }}
          </button>
        </div>
      </section>
    </div>
  </Teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: rgba(25, 17, 17, 0.43);
}

.modal-card {
  width: 100%;
  max-width: 365px;
  padding: 15px 14px 18px;
  color: #29090b;
  background: #fffafa;
  border-radius: 12px;
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.12);
}

.modal-heading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.modal-icon {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  color: white;
  background: #c9151b;
  border-radius: 9px;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 25px;
  font-weight: bold;
}

.modal-heading h2 {
  margin: 0;
  color: #29090b;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 19px;
  font-weight: 500;
  line-height: 1.35;
  text-align: center;
}

.modal-message {
  margin: 15px 0 17px;
  color: #321012;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 11px;
  line-height: 1.6;
  text-align: center;
  overflow-wrap: anywhere;
}

.modal-actions {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.back-button,
.confirm-button {
  min-height: 34px;
  padding: 0 15px;
  border-radius: 10px;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 11px;
  font-weight: bold;
  cursor: pointer;
}

.back-button {
  color: #39090c;
  background: #fffafa;
  border: 1px solid #a8797d;
}

.back-button:hover {
  background: #efdfdf;
}

.confirm-button {
  color: white;
  background: #650f18;
  border: 1px solid #650f18;
}

.confirm-button:hover {
  background: #51090e;
}

.confirm-button.danger {
  background: #d40000;
  border-color: #d40000;
}

.confirm-button.danger:hover {
  background: #b00000;
}

@media (max-width: 420px) {
  .modal-card {
    padding: 15px 12px;
  }

  .modal-heading {
    gap: 8px;
  }

  .modal-heading h2 {
    font-size: 16px;
  }
}
</style>
