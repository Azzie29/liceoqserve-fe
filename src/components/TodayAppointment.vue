
<script setup>
const appointment = {
  time: '11:00 AM',
  name: 'Rainier Amparo',
  activity: 'Book Borrowing',
  status: 'Confirmed',
}
</script>

<template>
  <section class="activity-card">
    <h2>Today's Appointment</h2>

    <div class="appointment-row">
      <strong>{{ appointment.time }}</strong>

      <div class="details">
        <strong>{{ appointment.name }}</strong>
        <span>{{ appointment.activity }}</span>
      </div>

      <span class="status">{{ appointment.status }}</span>
    </div>
  </section>
</template>

<style scoped>
.activity-card {
  min-width: 0;
  min-height: 184px;
  padding: 10px 12px;
  border: 1px solid #8a4143;
  border-radius: 24px;
}

h2 {
  margin: 0 0 14px;
  font: bold 24px Georgia, serif;
}

.appointment-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 4px 0 20px;
  border-bottom: 1px solid #e4caca;
  font-size: 12px;
}

.details {
  display: flex;
  flex: 1;
  min-width: 0;
  flex-direction: column;
  gap: 2px;
}

.details strong {
  font-size: 14px;
}

.status {
  padding: 4px 12px;
  border-radius: 20px;
  background: #b9e0c6;
  color: #315f42;
  font-size: 10px;
  white-space: nowrap;
}

@media (max-width: 480px) {
  .appointment-row {
    flex-wrap: wrap;
  }
}
</style>
