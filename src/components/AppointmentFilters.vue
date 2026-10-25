
<script setup>
defineProps({
  search: { type: String, default: '' },
  status: { type: String, default: 'All' },
})

const emit = defineEmits(['update:search', 'update:status'])
</script>

<template>
  <section class="filters">
    <input
      :value="search"
      type="search"
      placeholder="Search by student or appointment..."
      @input="emit('update:search', $event.target.value)"
    />

    <select
      :value="status"
      @change="emit('update:status', $event.target.value)"
    >
      <option>All</option>
      <option>Pending</option>
      <option>Confirmed</option>
      <option>Completed</option>
      <option>Cancelled</option>
    </select>
  </section>
</template>

<style scoped>
.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 20px;
}

input,
select {
  min-height: 42px;
  padding: 10px 14px;
  border: 1px solid #b98b8c;
  border-radius: 9px;
  background: #fff8f7;
  color: #390607;
  font: inherit;
}

input {
  flex: 1;
  min-width: 220px;
}

select {
  min-width: 150px;
}
</style>
