
<script setup>
const recentWorks = [
  {
    name: 'Rainier Amparo · Book Borrowing',
    code: 'LIB-018',
    status: 'Processing',
  },
  {
    name: 'Chloe Monteza · Clearance Signing',
    code: 'CLR-011',
    status: 'Processing',
  },
]
</script>

<template>
  <section class="activity-card">
    <h2>Recent Work</h2>

    <div
      v-for="work in recentWorks"
      :key="work.code"
      class="work-row"
    >
      <div class="details">
        <strong>{{ work.name }}</strong>
        <span>{{ work.code }}</span>
      </div>

      <span class="status">{{ work.status }}</span>
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

.work-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 5px 0 16px;
  border-bottom: 1px solid #e4caca;
  font-size: 12px;
}

.work-row + .work-row {
  padding-top: 10px;
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
  overflow-wrap: anywhere;
}

.status {
  padding: 4px 12px;
  border-radius: 20px;
  background: #eee08b;
  color: #665a1a;
  font-size: 10px;
  white-space: nowrap;
}
</style>
