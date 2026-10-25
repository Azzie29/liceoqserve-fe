
<script setup>
const stats = [
  { title: "TODAY'S TRANSACTION", count: 1 },
  { title: 'PENDING REQUESTS', count: 2 },
  { title: 'OVERDUE REQUESTS', count: 4 },
  { title: 'ROOM RESERVATION', count: 1 },
]
</script>

<template>
  <section class="stats">
    <article
      v-for="item in stats"
      :key="item.title"
      class="stat-card"
    >
      <p>{{ item.title }}</p>
      <strong>{{ item.count }}</strong>
      <button type="button">View Details</button>
    </article>
  </section>
</template>

<style scoped>
.stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 197px));
  gap: 17px 20px;
  margin-bottom: 22px;
}

.stat-card {
  min-height: 106px;
  padding: 15px 13px;
  border: 1px solid #8a4143;
  border-radius: 24px;
}

.stat-card p {
  margin: 0 0 6px;
  color: #765456;
  font-size: 12px;
  letter-spacing: 1px;
}

.stat-card strong {
  display: block;
  margin: 0 0 4px 12px;
  font: bold 30px Georgia, serif;
}

.stat-card button {
  padding: 0;
  border: 0;
  background: transparent;
  color: #390607;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

@media (max-width: 900px) {
  .stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
