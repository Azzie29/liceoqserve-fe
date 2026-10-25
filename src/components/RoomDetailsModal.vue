
<script setup>
defineProps({
  show: Boolean,
  room: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['close'])
</script>

<template>
  <div
    v-if="show && room"
    class="overlay"
    @click.self="emit('close')"
  >
    <section class="details-modal" role="dialog" aria-modal="true">
      <div class="top-row">
        <div>
          <p class="eyebrow">ROOM RESERVATION DETAILS</p>
          <h2>{{ room.name }}</h2>
          <p class="date">{{ room.date || 'No reservation date' }}</p>
        </div>

        <button class="close-button" @click="emit('close')">
          Close
        </button>
      </div>

      <div class="details-grid">
        <div>
          <span>Room #</span>
          <strong>{{ room.name }}</strong>
        </div>

        <div>
          <span>Student</span>
          <strong>{{ room.reservedBy || 'No current reservation' }}</strong>
        </div>

        <div>
          <span>No. of Students</span>
          <strong>{{ room.students }}</strong>
        </div>

        <div>
          <span>Time</span>
          <strong>{{ room.time || 'Not scheduled' }}</strong>
        </div>

        <div>
          <span>Status</span>
          <strong>{{ room.status }}</strong>
        </div>

        <div>
          <span>Purpose</span>
          <strong>{{ room.purpose || 'Not specified' }}</strong>
        </div>
      </div>

      <div class="notes">
        <strong>Notes / Instructions:</strong>
        {{ room.notes || 'No additional instructions.' }}
      </div>
    </section>
  </div>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: grid;
  place-items: center;
  padding: 20px;
  background: rgb(0 0 0 / 45%);
}

.details-modal {
  width: min(100%, 560px);
  padding: 20px;
  border-radius: 12px;
  background: #f8eeee;
  color: #390607;
  box-shadow: 0 8px 30px rgb(0 0 0 / 20%);
}

.top-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 24px;
}

.eyebrow {
  margin: 0 0 5px;
  color: #765456;
  font-size: 10px;
}

h2 {
  margin: 0;
  font: bold 23px Georgia, serif;
}

.date {
  margin: 5px 0 0;
  font-size: 11px;
}

.close-button {
  padding: 4px 8px;
  border: none;
  background: transparent;
  color: #765456;
  font-size: 11px;
  cursor: pointer;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px 12px;
}

.details-grid div {
  display: flex;
  flex-direction: column;
  gap: 5px;
  min-width: 0;
}

.details-grid span {
  color: #765456;
  font-size: 10px;
}

.details-grid strong {
  overflow-wrap: anywhere;
  font-size: 11px;
}

.notes {
  margin-top: 22px;
  padding: 14px;
  border-radius: 7px;
  background: #ead6d6;
  font-size: 11px;
  line-height: 1.5;
}

@media (max-width: 480px) {
  .details-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
