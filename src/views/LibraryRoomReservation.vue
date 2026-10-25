
<script setup>
import { ref } from 'vue'
import RoomCard from '../components/RoomCard.vue'
import RoomDetailsModal from '../components/RoomDetailsModal.vue'
import RoomConfirmationModal from '../components/RoomConfirmationModal.vue'

const rooms = ref([
  {
    id: 1,
    name: 'DISCUSSION ROOM 1',
    status: 'Reserved',
    reservedBy: 'Mary Jane Dee',
    students: 3,
    date: 'Oct 25, 2026',
    time: '2:00 PM - 4:00 PM',
    purpose: 'Project Making',
    notes: 'All required information was verified.',
    graceNote:
      '15-minute arrival grace period. If the student does not arrive, the reservation expires.',
  },
  {
    id: 2,
    name: 'DISCUSSION ROOM 2',
    status: 'Available',
    reservedBy: '',
    students: 0,
    date: '',
    time: '',
    purpose: '',
    notes: '',
    graceNote: '',
  },
  {
    id: 3,
    name: 'DISCUSSION ROOM 3',
    status: 'In Use',
    reservedBy: 'Nicole Fei',
    students: 4,
    date: 'Oct 25, 2026',
    time: '1:00 PM - 3:00 PM',
    purpose: 'Group Study',
    notes: 'Reservation checked in.',
    graceNote: '',
  },
  {
    id: 4,
    name: 'DISCUSSION ROOM 4',
    status: 'Not Available',
    reservedBy: 'Faculty Use',
    students: 0,
    date: '',
    time: '',
    purpose: 'Faculty Use',
    notes: 'Reserved for faculty use.',
    graceNote: '',
  },
])

const showDetails = ref(false)
const selectedRoom = ref(null)

const showConfirmation = ref(false)
const confirmationAction = ref('')
const confirmationRoom = ref(null)

function viewDetails(room) {
  selectedRoom.value = room
  showDetails.value = true
}

function closeDetails() {
  showDetails.value = false
  selectedRoom.value = null
}

function openConfirmation(room, action) {
  confirmationRoom.value = room
  confirmationAction.value = action
  showConfirmation.value = true
}

function closeConfirmation() {
  showConfirmation.value = false
  confirmationRoom.value = null
  confirmationAction.value = ''
}

function confirmRoomAction() {
  const room = confirmationRoom.value

  if (!room) return

  if (confirmationAction.value === 'check-in') {
    room.status = 'In Use'
    room.notes = 'Reservation checked in.'
  }

  if (confirmationAction.value === 'expired') {
    room.status = 'Available'
    room.reservedBy = ''
    room.students = 0
    room.date = ''
    room.time = ''
    room.purpose = ''
    room.notes = 'Reservation expired.'
    room.graceNote = ''
  }

  if (confirmationAction.value === 'end-use') {
    room.status = 'Available'
    room.reservedBy = ''
    room.students = 0
    room.date = ''
    room.time = ''
    room.purpose = ''
    room.notes = 'Room use completed.'
    room.graceNote = ''
  }

  closeConfirmation()
}
</script>

<template>
  <main class="room-page">
    <header class="page-heading">
      <div>
        <p class="eyebrow">LIBRARY PORTAL / ROOM RESERVATION</p>
        <h1>Room Reservations</h1>
        <p>
          Manage discussion room availability, check-ins, and room usage.
        </p>
      </div>

      <span class="room-count">{{ rooms.length }} Rooms</span>
    </header>

    <section class="room-groups">
      <div class="room-group">
        <RoomCard
          v-for="room in rooms.slice(0, 2)"
          :key="room.id"
          :room="room"
          @view-details="viewDetails"
          @check-in="openConfirmation($event, 'check-in')"
          @expired="openConfirmation($event, 'expired')"
          @end-use="openConfirmation($event, 'end-use')"
        />
      </div>

      <div class="room-group">
        <RoomCard
          v-for="room in rooms.slice(2, 4)"
          :key="room.id"
          :room="room"
          @view-details="viewDetails"
          @check-in="openConfirmation($event, 'check-in')"
          @expired="openConfirmation($event, 'expired')"
          @end-use="openConfirmation($event, 'end-use')"
        />
      </div>
    </section>

    <p class="availability-note">
      Room availability is a reference and may change. Please confirm with
      library staff.
    </p>

    <RoomDetailsModal
      :show="showDetails"
      :room="selectedRoom"
      @close="closeDetails"
    />

    <RoomConfirmationModal
      :show="showConfirmation"
      :room="confirmationRoom"
      :action="confirmationAction"
      @close="closeConfirmation"
      @confirm="confirmRoomAction"
    />
  </main>
</template>

<style scoped>
.room-page {
  min-width: 0;
  padding: 28px;
  background: #eadcda;
  color: #390607;
}

.page-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 24px;
}

.eyebrow {
  margin: 0 0 8px;
  color: #765456;
  font-size: 10px;
  letter-spacing: 1.2px;
}

.page-heading h1 {
  margin: 0 0 8px;
  font: 30px Georgia, serif;
}

.page-heading p:not(.eyebrow) {
  margin: 0;
  color: #765456;
  font-size: 12px;
  line-height: 1.5;
}

.room-count {
  padding: 9px 15px;
  border: 1px solid #d2b1b2;
  border-radius: 20px;
  background: #f8eeee;
  font-size: 12px;
  white-space: nowrap;
}

.room-groups {
  display: grid;
  gap: 18px;
}

.room-group {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  padding: 16px;
  border: 1px solid #d2b1b2;
  border-radius: 14px;
  background: #f4e8e7;
}

.availability-note {
  margin: 18px 0 0;
  color: #765456;
  font-size: 11px;
  line-height: 1.5;
}

@media (max-width: 850px) {
  .room-page {
    padding: 16px;
  }

  .room-group {
    grid-template-columns: 1fr;
    padding: 10px;
  }
}
</style>
