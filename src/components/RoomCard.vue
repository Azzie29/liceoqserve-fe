
<script setup>
defineProps({
  room: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits([
  'view-details',
  'check-in',
  'expired',
  'end-use',
])

function statusClass(status) {
  return status.toLowerCase().replace(/\s+/g, '-')
}
</script>

<template>
  <article class="room-card">
    <div class="card-heading">
      <h2>{{ room.name }}</h2>
      <span class="status" :class="statusClass(room.status)">
        {{ room.status }}
      </span>
    </div>

    <p class="reserved-by">
      <template v-if="room.status === 'Available'">
        Open for reservation or walk-in
      </template>
      <template v-else>
        Reserved by: {{ room.reservedBy }}
      </template>
    </p>

    <p v-if="room.graceNote" class="grace-note">
      {{ room.graceNote }}
    </p>

    <div class="card-actions">
      <template v-if="room.status === 'Reserved'">
        <button @click="emit('check-in', room)">Check-In</button>
        <button @click="emit('view-details', room)">View Details</button>
        <button class="expired-button" @click="emit('expired', room)">
          Expired
        </button>
      </template>

      <template v-else-if="room.status === 'In Use'">
        <button @click="emit('view-details', room)">View Details</button>
        <button @click="emit('end-use', room)">End Use</button>
      </template>

      <template v-else-if="room.status === 'Available'">
        <button @click="emit('view-details', room)">View Details</button>
      </template>

      <template v-else>
        <button @click="emit('view-details', room)">View Details</button>
      </template>
    </div>
  </article>
</template>

<style scoped>
.room-card {
  min-width: 0;
  min-height: 120px;
  padding: 14px;
  border: 1px solid #dfc7c7;
  border-radius: 13px;
  background: #f8eeee;
  color: #390607;
}

.card-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
}

.card-heading h2 {
  margin: 0;
  font: 600 12px Arial, sans-serif;
}

.status {
  flex-shrink: 0;
  padding: 4px 12px;
  border-radius: 20px;
  background: #eee0a0;
  color: #594500;
  text-align: center;
  font-size: 9px;
}

.status.available {
  background: #eee0a0;
}

.status.reserved,
.status.in-use {
  background: #eee0a0;
}

.status.not-available {
  background: #f0caca;
  color: #8e2727;
}

.reserved-by {
  margin: 7px 0;
  font-size: 10px;
}

.grace-note {
  max-width: 100%;
  margin: 8px 0;
  padding: 8px;
  border-radius: 5px;
  background: #f1e8bf;
  color: #594b22;
  font-size: 9px;
  line-height: 1.4;
}

.card-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 10px;
}

button {
  min-height: 28px;
  padding: 5px 10px;
  border: 1px solid #95686a;
  border-radius: 6px;
  background: transparent;
  color: #390607;
  font-size: 10px;
  font-weight: 600;
  cursor: pointer;
}

button:hover {
  background: #ead6d6;
}

.expired-button {
  min-width: 95px;
}
</style>
