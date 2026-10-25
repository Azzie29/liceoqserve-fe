
<template>
  <header class="library-header">
    <div class="brand">
      <div class="brand-logo">LQ</div>

      <div class="brand-text">
        <h2>LiceoQServe</h2>
        <p>Library Portal</p>
      </div>
    </div>

    <div class="staff">
      <span class="staff-name">Mr. Dhan Jee</span>
      <span class="staff-role">Authorized Staff</span>
    </div>
  </header>
</template>

<style scoped>
.library-header {
  min-height: 104px;
  padding: 20px;
  background: #56090d;
  color: #fff7f5;
  border: 1px solid #280304;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand-logo {
  padding: 12px;
  border-radius: 9px;
  background: #6a2023;
  font: bold 18px Georgia, serif;
}

.brand-text h2,
.brand-text p {
  margin: 0;
}

.brand-text h2 {
  font: bold 21px Georgia, serif;
}

.brand-text p {
  margin-top: 2px;
  color: #d9b8b8;
  font: bold 12px Georgia, serif;
}

.staff {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.staff-name {
  font-size: 21px;
}

.staff-role {
  font-size: 13px;
}

@media (max-width: 480px) {
  .library-header {
    padding: 12px;
  }

  .brand-text h2 {
    font-size: 16px;
  }

  .staff-name {
    font-size: 14px;
  }
}
</style>
