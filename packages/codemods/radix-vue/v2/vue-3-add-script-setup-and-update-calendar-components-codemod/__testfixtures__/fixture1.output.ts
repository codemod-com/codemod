< script setup lang = "ts" >
  function pagingFunc(date: DateValue, sign: -1 | 1) {
    if (sign === -1)
      return date.subtract({ years: 1 })
    return date.add({ years: 1 })
  } <
  /script>

  <
  template >
  <
  CalendarPrev: prev - page = "(date: DateValue) => pagingFunc(date, -1)" / >

  <
  CalendarNext: next - page = "(date: DateValue) => pagingFunc(date, 1)" / >
  <
  /template>