
<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  request: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits([
  'save',
  'change-status',
  'close',
])

const expectedDate = ref('')
const instruction = ref('')

watch(
  () => props.request,
  (request) => {
    expectedDate.value = request?.expectedDate || ''
    instruction.value = request?.instruction || ''
  },
  { immediate: true },
)

function saveRequest() {
  if (!props.request) return

  emit('save', {
    ...props.request,
    expectedDate: expectedDate.value,
    instruction: instruction.value,
  })
}
</script>

<template>
  <section class="details-panel">
    <template v-if="request">
      <div class="panel-heading">
        <h2>Request details</h2>
        <button class="close-button" @click="$emit('close')">
          Close
        </button>
      </div>

      <h3>{{ request.type }}</h3>

      <div class="details-grid">
        <div>
          <span>Student</span>
          <strong>{{ request.studentName }}</strong>
        </div>

        <div>
          <span>Student ID</span>
          <strong>{{ request.studentId }}</strong>
        </div>

        <div>
          <span>Request number</span>
          <strong>{{ request.requestNumber }}</strong>
        </div>

        <div>
          <span>Current status</span>
          <strong>{{ request.status }}</strong>
        </div>
      </div>

      <label for="expected-date">Expected completion</label>
      <input
        id="expected-date"
        v-model="expectedDate"
        type="date"
      />

      <label for="request-instruction">Instruction / Notes</label>
      <textarea
        id="request-instruction"
        v-model="instruction"
        rows="4"
        placeholder="Enter instructions for the student..."
      />

      <button class="save-button" @click="saveRequest">
        Save and notify student
      </button>

      <div class="status-actions">
        <button
          v-for="status in [
            'Pending',
            'Processing',
            'Completed',
            'Cancelled',
          ]"
          :key="status"
          type="button"
          :class="{ active: request.status === status }"
          @click="$emit('change-status', status)"
        >
          {{ status }}
        </button>
      </div>
    </template>

    <div v-else class="empty-state">
      Select a request to open its details.
    </div>
  </section>
</template>

<style scoped>
.details-panel {
  min-width: 0;
  padding: 18px;
  border: 1px solid #d6bdbc;
  border-radius: 12px;
  background: #f8eeee;
  color: #390607;
}

.panel-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}

h2 {
  margin: 0;
  font-size: 13px;
  font-weight: 400;
}

h3 {
  margin: 12px 0 18px;
  font-family: Georgia, serif;
  font-size: 22px;
}

.close-button {
  border: 0;
  background: transparent;
  color: #765c5d;
  cursor: pointer;
  font-size: 11px;
}

.details-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px 12px;
  margin-bottom: 20px;
}

.details-grid div {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.details-grid span {
  color: #765c5d;
  font-size: 10px;
}

.details-grid strong {
  font-size: 11px;
  overflow-wrap: anywhere;
}

label {
  display: block;
  margin: 12px 0 6px;
  font-size: 11px;
  font-weight: 600;
}

input,
textarea {
  width: 100%;
  box-sizing: border-box;
  padding: 10px;
  border: 1px solid #d6bdbc;
  border-radius: 7px;
  background: #fff8f7;
  color: #390607;
  font: inherit;
  font-size: 12px;
}

textarea {
  resize: vertical;
}

.save-button {
  width: 100%;
  margin-top: 12px;
  padding: 10px;
  border: 0;
  border-radius: 6px;
  background: #56090d;
  color: white;
  cursor: pointer;
  font-size: 11px;
}

.status-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-top: 12px;
}

.status-actions button {
  padding: 7px 9px;
  border: 1px solid #8c5c5e;
  border-radius: 7px;
  background: transparent;
  color: #390607;
  cursor: pointer;
  font-size: 10px;
}

.status-actions button.active {
  background: #56090d;
  color: white;
}

.empty-state {
  display: grid;
  min-height: 180px;
  place-items: center;
  color: #8b7777;
  text-align: center;
  font-size: 12px;
}
</style>
