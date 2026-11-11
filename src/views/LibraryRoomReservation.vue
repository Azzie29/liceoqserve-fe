
<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { supabase } from '../lib/Supabase.js'

import RoomCard from '../components/RoomCard.vue'
import RoomDetailsModal from '../components/RoomDetailsModal.vue'
import RoomConfirmationModal from '../components/RoomConfirmationModal.vue'

// LIBRARY ROOM RESERVATION SERVICE IDs
const LIBRARY_SERVICE_IDS = [
  '987d7769-8a02-44a1-9b95-cdfec559a70e',
  'faa4239d-cae7-4fe7-af69-3f25bec2fe44',
]

// Marker used to identify checked-in reservations
const CHECKED_IN_MARKER = '[ROOM_CHECKED_IN]'

const rooms = ref([])
const loading = ref(false)
const errorMessage = ref('')

const showDetails = ref(false)
const selectedRoom = ref(null)

const showConfirmation = ref(false)
const confirmationAction = ref('')
const confirmationRoom = ref(null)

let reservationChannel = null
let roomChannel = null

// GROUP ROOMS BY TWO
const roomGroups = computed(() => {
  const groups = []

  for (let i = 0; i < rooms.value.length; i += 2) {
    groups.push(rooms.value.slice(i, i + 2))
  }

  return groups
})

// FORMAT DATE
function formatDate(value) {
  if (!value) return ''

  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

// FORMAT TIME
function formatTime(value) {
  if (!value) return ''

  return new Date(value).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })
}

// CHECK IF RESERVATION WAS CHECKED IN
function isCheckedIn(staffNotes) {
  return String(staffNotes || '').includes(CHECKED_IN_MARKER)
}

// REMOVE INTERNAL CHECK-IN MARKER FROM DISPLAY
function cleanStaffNotes(staffNotes) {
  return String(staffNotes || '')
    .replace(CHECKED_IN_MARKER, '')
    .trim()
}

// GET ROOM RESERVATION STATUS
function getRoomStatus(room, reservation) {
  if (reservation) {
    if (isCheckedIn(reservation.staff_notes)) {
      return 'In Use'
    }

    return 'Reserved'
  }

  return room.is_available ? 'Available' : 'Not Available'
}

// LOAD ROOMS AND RESERVATIONS FROM SUPABASE
async function fetchRooms() {
  loading.value = true
  errorMessage.value = ''

  try {
    // 1. GET LIBRARY ROOMS
    const { data: roomData, error: roomError } = await supabase
      .from('rooms')
      .select(`
        id,
        name,
        room_type,
        location,
        capacity,
        is_available,
        notes
      `)
      .eq('location', 'Library')
      .order('name', { ascending: true })

    if (roomError) throw roomError

    // 2. GET LIBRARY RESERVATIONS
    const { data: reservationData, error: reservationError } =
      await supabase
        .from('reservations')
        .select(`
          id,
          student_id,
          service_id,
          resource_name,
          room_id,
          start_at,
          end_at,
          purpose,
          status,
          handled_by,
          staff_notes
        `)
        .in('service_id', LIBRARY_SERVICE_IDS)
        .in('status', ['pending', 'confirmed'])
        .order('start_at', { ascending: true })

    if (reservationError) throw reservationError

    // 3. GET STUDENT NAMES
    const studentIds = [
      ...new Set(
        (reservationData || [])
          .map(item => item.student_id)
          .filter(Boolean)
      ),
    ]

    let studentMap = {}

    if (studentIds.length > 0) {
      const { data: studentData, error: studentError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', studentIds)

      if (studentError) throw studentError

      studentMap = Object.fromEntries(
        (studentData || []).map(student => [
          student.id,
          student.full_name,
        ])
      )
    }

    // 4. MATCH RESERVATIONS WITH ROOMS
    const mappedRooms = (roomData || []).map(room => {
      const reservation = (reservationData || []).find(item => {
        if (item.room_id) {
          return item.room_id === room.id
        }

        return (
          item.resource_name?.toLowerCase() ===
          room.name?.toLowerCase()
        )
      })

      const studentName = reservation
        ? studentMap[reservation.student_id] || 'Student'
        : ''

      const staffNotes = reservation?.staff_notes || ''

      return {
        id: room.id,
        name: room.name.toUpperCase(),
        roomType: room.room_type,
        location: room.location,
        capacity: room.capacity,
        isAvailable: room.is_available,

        status: getRoomStatus(room, reservation),

        reservedBy: studentName,
        students: reservation ? 'Not specified' : 0,

        date: reservation
          ? formatDate(reservation.start_at)
          : '',

        time: reservation
          ? `${formatTime(reservation.start_at)} - ${formatTime(reservation.end_at)}`
          : '',

        purpose: reservation?.purpose || '',
        notes: cleanStaffNotes(staffNotes),

        graceNote: reservation && !isCheckedIn(staffNotes)
          ? '15-minute arrival grace period. If the student does not arrive, the reservation may be marked as no-show.'
          : '',

        reservationId: reservation?.id || null,
        reservationStatus: reservation?.status || null,
        staffNotes,
      }
    })

    rooms.value = mappedRooms

    // Keep the selected room updated when details are open
    if (selectedRoom.value) {
      selectedRoom.value =
        mappedRooms.find(room => room.id === selectedRoom.value.id) || null
    }

    if (confirmationRoom.value) {
      confirmationRoom.value =
        mappedRooms.find(room => room.id === confirmationRoom.value.id) || null
    }
  } catch (error) {
    console.error('Error loading room reservations:', error)
    errorMessage.value =
      error.message || 'Unable to load room reservations.'
  } finally {
    loading.value = false
  }
}

// VIEW ROOM DETAILS
function viewDetails(room) {
  selectedRoom.value = room
  showDetails.value = true
}

function closeDetails() {
  showDetails.value = false
  selectedRoom.value = null
}

// OPEN CONFIRMATION
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

// CONFIRM ROOM ACTION
async function confirmRoomAction() {
  const room = confirmationRoom.value

  if (!room || !room.reservationId) {
    errorMessage.value = 'No active reservation was found for this room.'
    closeConfirmation()
    return
  }

  try {
    const { data: authData, error: authError } =
      await supabase.auth.getUser()

    if (authError) throw authError

    const staffId = authData.user?.id

    let updateData = {
      updated_at: new Date().toISOString(),
    }

    // CHECK-IN
    if (confirmationAction.value === 'check-in') {
      const existingNotes = cleanStaffNotes(room.staffNotes)

      updateData.status = 'confirmed'
      updateData.staff_notes = [
        existingNotes,
        CHECKED_IN_MARKER,
        'Reservation checked in.',
      ]
        .filter(Boolean)
        .join('\n')
    }

    // MARK AS NO-SHOW / EXPIRED
    if (confirmationAction.value === 'expired') {
      const existingNotes = cleanStaffNotes(room.staffNotes)

      updateData.status = 'no_show'
      updateData.staff_notes = [
        existingNotes,
        'Reservation expired. Student did not arrive within the grace period.',
      ]
        .filter(Boolean)
        .join('\n')
    }

    // END ROOM USE
    if (confirmationAction.value === 'end-use') {
      const existingNotes = cleanStaffNotes(room.staffNotes)

      updateData.status = 'completed'
      updateData.staff_notes = [
        existingNotes,
        'Room use completed.',
      ]
        .filter(Boolean)
        .join('\n')
    }

    if (staffId) {
      updateData.handled_by = staffId
    }

    const { error } = await supabase
      .from('reservations')
      .update(updateData)
      .eq('id', room.reservationId)
      .in('service_id', LIBRARY_SERVICE_IDS)

    if (error) throw error

    closeConfirmation()

    // Reload updated database records
    await fetchRooms()
  } catch (error) {
    console.error('Error updating room reservation:', error)
    errorMessage.value =
      error.message || 'Unable to update room reservation.'
  }
}

// REALTIME UPDATES
function subscribeToRoomChanges() {
  reservationChannel = supabase
    .channel('library-room-reservations')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'reservations',
      },
      () => {
        fetchRooms()
      }
    )
    .subscribe()

  roomChannel = supabase
    .channel('library-rooms')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'rooms',
      },
      () => {
        fetchRooms()
      }
    )
    .subscribe()
}

onMounted(async () => {
  await fetchRooms()
  subscribeToRoomChanges()
})

onUnmounted(() => {
  if (reservationChannel) {
    supabase.removeChannel(reservationChannel)
  }

  if (roomChannel) {
    supabase.removeChannel(roomChannel)
  }
})
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

      <div class="heading-actions">
        <button
          class="refresh-button"
          type="button"
          :disabled="loading"
          @click="fetchRooms"
        >
          {{ loading ? 'Refreshing...' : 'Refresh' }}
        </button>

        <span class="room-count">{{ rooms.length }} Rooms</span>
      </div>
    </header>

    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>

    <div v-if="loading && rooms.length === 0" class="loading-message">
      Loading library rooms...
    </div>

    <div
      v-else-if="!loading && rooms.length === 0"
      class="empty-message"
    >
      No library rooms were found.
    </div>

    <section v-else class="room-groups">
      <div
        v-for="(group, index) in roomGroups"
        :key="index"
        class="room-group"
      >
        <RoomCard
          v-for="room in group"
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

.heading-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.room-count {
  padding: 9px 15px;
  border: 1px solid #d2b1b2;
  border-radius: 20px;
  background: #f8eeee;
  font-size: 12px;
  white-space: nowrap;
}

.refresh-button {
  padding: 9px 15px;
  border: 1px solid #650b18;
  border-radius: 20px;
  background: #650b18;
  color: white;
  font-size: 12px;
  cursor: pointer;
  transition: 0.2s ease;
}

.refresh-button:hover:not(:disabled) {
  background: #50070e;
}

.refresh-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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

.loading-message,
.empty-message {
  padding: 35px 20px;
  border: 1px solid #d2b1b2;
  border-radius: 14px;
  background: #f4e8e7;
  color: #765456;
  text-align: center;
  font-size: 13px;
}

.error-message {
  margin-bottom: 16px;
  padding: 12px 15px;
  border: 1px solid #d8a5a5;
  border-radius: 10px;
  background: #f8eeee;
  color: #8b2020;
  font-size: 12px;
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

@media (max-width: 480px) {
  .heading-actions {
    width: 100%;
    justify-content: space-between;
  }
}
</style>
