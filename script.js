// Get the input field and process button elements
const rollInp = document.querySelector('#rolls')
const processBtn = document.querySelector('#process')

// Get the count span elements
const stdCountSpan = document.getElementById('stdCount')
const presentCountSpan = document.getElementById('presentCount')
const absentCountSpan = document.getElementById('absentCount')
const mistakeCountSpan = document.getElementById('mistakeCount')

// Global Vars
let presentRolls = [],
  absentRolls = {},
  omrMistakeRolls = []
let selectedAction = 'absent'

// Add event listener to the process button
processBtn.addEventListener('click', () => {
  const rolls = rollInp.value
  let rollsArr = rolls.match(/\d{6}/g)
  if (!rollsArr) return alert("Enter Valid 6 digit Roll Numbers separated with space or comma")
  let sortedRolls = rollsArr.sort((a, b) => Number(a) - Number(b))
  presentRolls = sortedRolls
  stdCountSpan.textContent = presentRolls.length
  // Clear Old Values
  absentRolls = {}
  omrMistakeRolls = []
  updateCounts()
  updatePrintable()

})

// Handle past btn
const pasteBtn = document.querySelector('#paste')
pasteBtn.addEventListener('click', async () => {
  try {
    // Check for clipboard permissions
    const text = await navigator.clipboard.readText();
    rollInp.value = text
    processBtn.click()
  } catch (error) {
    console.error("Failed to read clipboard contents:", error);
    alert("Can't Access Your Clipboard")
  }
})

// Select action
const changeAction = (action) => {
  selectedAction = action
  if (action == 'absent') {
    document.getElementById('wrongOmr').classList.remove('selected')
    document.getElementById('absent').classList.add('selected')
  }
  else {
    document.getElementById('absent').classList.remove('selected')
    document.getElementById('wrongOmr').classList.add('selected')
  }
}

const updateCounts = () => {
  presentCountSpan.textContent = presentRolls.filter(roll => roll !== '').length
  absentCountSpan.textContent = Object.keys(absentRolls).length
  mistakeCountSpan.textContent = omrMistakeRolls.length

  // Display Rolls=============
  // 1. Present Rolls
  let rollsHtml = ''
  presentRolls.forEach((roll, index) => {
    rollsHtml += `<span class="roll"  onclick="handleRollClick('${roll}',${index})">${roll}</span>`
  })
  document.getElementById('rollsContainer').innerHTML = rollsHtml

  // 2. Absent Rolls
  let absentRollsHtml = ''
  for (let roll in absentRolls) {
    absentRollsHtml += `<span class="roll" onclick="cancelAbsent('${roll}',${absentRolls[roll]})">${roll}</span>`
  }
  document.getElementById('absentRollsContainer').innerHTML = absentRollsHtml

  // 3. OMR Mistake Rolls
  let wrongOmrHtml = ''
  omrMistakeRolls.forEach((roll, index) => {
    wrongOmrHtml += `<span class="roll"  onclick="removeOmr('${roll}',${index})">${roll}</span>`
  })
  document.getElementById('wrongOmrRollsContainer').innerHTML = wrongOmrHtml
}


const handleRollClick = (roll, index, needUpdate = 1) => {
  console.log(selectedAction, roll)
  if (roll == '') return;

  if (selectedAction == 'absent') {
    if (absentRolls[roll] !== undefined) return alert('⚠ "' + roll + '" is already marked as Absent.')
    if (omrMistakeRolls.includes(roll)) return alert('⚠ "' + roll + '" is already marked as OMR mistake.')
    presentRolls[index] = '' // Make it Blank in Present Rolls
    absentRolls[roll] = index
  }
  else {
    if (omrMistakeRolls.includes(roll)) return alert('⚠ "' + roll + '" is already marked as OMR mistake')
    omrMistakeRolls = [...new Set([...omrMistakeRolls, roll])].sort((a, b) => Number(a) - Number(b))
  }
  if (!needUpdate) return
  updateCounts()
  updatePrintable()
}

const cancelAbsent = (roll, index) => {
  // console.log(roll, index)
  presentRolls[index] = roll
  delete absentRolls[roll]
  updateCounts()
  updatePrintable()
}

const removeOmr = (roll, index) => {
  omrMistakeRolls.splice(index, 1)
  updateCounts()
  updateCounts()
}


const copyRolls = (type) => {
  let content = '';
  // let separator = '	' //tab
  let separator = '  ' //space
  if (type == "present") {
    content = presentRolls.filter(roll => roll !== '').join(separator)
  } else if (type == 'absent') {
    content = Object.keys(absentRolls).join(separator)
  } else {
    content = omrMistakeRolls.join(separator)
  }
  navigator.clipboard.writeText(content);
}


// Search & set absent click event
let searchInp = document.getElementById('searchInput')
let searchBtn = document.getElementById('searchBtn')
let searchLogSpan = document.getElementById('searchLog')
searchBtn.addEventListener('click', () => {
  searchLogSpan.innerHTML = ''
  const searchedRoll = searchInp.value
  let searchRollArr = searchedRoll.match(/\d+/g)
  if (!searchedRoll || !searchRollArr) return

  let found = notFound = alreadyAdded = ''

  searchRollArr.forEach(roll => {
    let presentIndex = presentRolls.indexOf(roll)

    // Invalid: not in presentRolls or absentRolls
    if (presentIndex == -1 && absentRolls[roll] == undefined) return notFound += roll + ' '
    // Valid Roll
    handleRollClick(roll, presentIndex, 0)

    if (selectedAction == 'absent' && absentRolls[roll] !== undefined) return // Already Marked as Absent
    else if (selectedAction == 'omr' && omrMistakeRolls.includes(roll)) return // Already Marked as OMR Mistake
    found += roll + ' '
  })

  if (notFound != '') {
    searchInp.value = notFound
  } else {
    searchInp.value = notFound
  }
  searchLogSpan.innerHTML = `${selectedAction == 'absent' ? '👇Absent:' : '🔴OMR Mistake:'} ${found ? '</br><span class="successLog">' + found + 'Found.</span>' : ''} ${notFound ? '</br><span class="errorLog">' + notFound + 'Not Found</span>' : ''}`

  updateCounts()
  updatePrintable()
})


// Utility Functions +++++++++++++
function convertToBanglaNumerals(number) {
  const banglaDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return number.toString().replace(/\d/g, digit => banglaDigits[digit]);
}
// ++++++++++++++++++++++++++++++++++++

// Update Printable
let pPresentRoll = document.getElementById('present-roll')
let pAbsentRoll = document.getElementById('absent-roll')
let pOmrRoll = document.getElementById('omr-roll')
// Counts 
let pPresentCountSpans = document.querySelectorAll('.p-presentCount')
let pOmrCountSpans = document.getElementById('p-omrCount')
let pAbsentCountSpans = document.getElementById('p-absentCount')


let updatePrintable = () => {
  let rollsHtml = ''
  let absentRollsHtml = ''
  let wrongOmrHtml = ''

  // 1. Present Rolls
  presentRolls.forEach((roll, index) => {
    if (roll == '') return
    rollsHtml += `<span>${roll}</span>`
  })
  // 2. Absent Rolls
  for (let roll in absentRolls) {
    absentRollsHtml += `<span>${roll}</span>`
  }
  // 3. OMR Mistake Rolls
  omrMistakeRolls.forEach((roll, index) => {
    wrongOmrHtml += `<span>${roll}</span>`
  })

  pPresentRoll.innerHTML = rollsHtml
  pAbsentRoll.innerHTML = absentRollsHtml
  pOmrRoll.innerHTML = wrongOmrHtml

  let presentCount = convertToBanglaNumerals(presentRolls.filter(roll => roll !== '').length)
  pPresentCountSpans.forEach(span => span.innerHTML = presentCount)
  pOmrCountSpans.textContent = convertToBanglaNumerals(omrMistakeRolls.length)
  pAbsentCountSpans.textContent = convertToBanglaNumerals(Object.keys(absentRolls).length)
}




// print
function printDiv(divId) {
  const content = document.getElementById(divId).innerHTML; // Get the specific div's content
  const originalContent = document.body.innerHTML; // Save the original page content

  document.body.innerHTML = content; // Replace the entire page with the div's content
  window.print(); // Open the print dialog
  document.body.innerHTML = originalContent; // Restore the original page content
}





// =======================================================
// Test code to extract 4-digit roll numbers from a string
// =======================================================
// let testRolls = `885106	885108	885109	885110	885111	885112	885113	885114	885115	885116	885117	885118	885119	885120
// 885121	885122	885123	885124	885125	885126	885127	885129	885130	885132	885134	885135	885136	885137
// 885138	885140	885142	885143	885145	885147	885148	885149	885151	885152	885153	885154	885157	885158
// 885160	885161	885162	885163	885164	885171	885172	885173	885175	885176	885177	885178	885179	885181
// 885182	885185	885186	885187	789538	789571	885949 	789582	885379	885380	885382	885383	885384	885386
// 885387	885390	885391	885396	885397	885398	885399	885400	885403	885404	885405	885406	885408	885409
// 885410	885412	885413	885414	885415	885416	885418	885419	885420	885421	885422	885423	885424	885425
// 885426	885427	885428	885429	689023	789647	789697	789557
// `
// rollInp.value = testRolls
// processBtn.click()
// searchInp.value = `885106	885108	885109`