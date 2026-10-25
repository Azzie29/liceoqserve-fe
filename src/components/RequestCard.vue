
<script setup>
defineProps({
  request: {
    type: Object,
    required: true,
  },
  selected: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['select'])

function formatDate(date) {
  if (!date) return 'Not set'

  return new Date(`${date}T12:00:00`).toLocaleDateString(
    'en-US',
    {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    },
  )
}
</script>

<template>
  <button
    type="button"
    class="request-card"
    :class="{ selected }"
    :aria-pressed="selected"
    @click="$emit('select', request)"
  >
    <div class="card-top">
      <div class="student-info">
        <strong>{{ request.studentName }}</strong>
        <span>{{ request.requestNumber }} · {{ request.type }}</span>
        <small>Expected: {{ formatDate(request.expectedDate) }}</small>
      </div>

      <span
        class="status-badge"
        :class="request.status.toLowerCase()"
      >
        {{ request.status }}
      </span>
    </div>
  </button>
</template>

<style scoped>
.request-card {
  width: 100%;
  padding: 15px;
  border: 1px solid #d4bdbc;
  border-radius: 12px;
  background: #f8eeee;
  color: #390607;
  text-align: left;
  cursor: pointer;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.request-card:hover {
  border-color: #7d3034;
}

.request-card.selected {
  border: 2px solid #1685e5;
  padding: 14px;
  box-shadow: 0 2px 5px #39060712;
}

.card-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
}

.student-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
  min-width: 0;
}

.student-info strong {
  font-size: 13px;
}

.student-info span,
.student-info small {
  font-size: 10px;
  color: #765c5d;
}

.status-badge {
  flex-shrink: 0;
  padding: 5px 10px;
  border-radius: 20px;
  background: #f0df83;
  color: #654b00;
  font-size: 10px;
}

.status-badge.pending {
  background: #e9d5d5;
  color: #650b10;
}

.status-badge.processing {
  background: #f0df83;
  color: #654b00;
}

.status-badge.completed {
  background: #c6e8cd;
  color: #205b30;
}

.status-badge.cancelled {
  background: #e3dede;
  color: #554747;
}
</style>
