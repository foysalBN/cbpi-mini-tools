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
  presentRolls = rolls ? rolls.match(/\d{6}/g) : []
  stdCountSpan.textContent = presentRolls.length
  // Clear Old Values
  absentRolls = {}
  omrMistakeRolls = []
  updateCounts()

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


const handleRollClick = (roll, index) => {
  console.log(selectedAction, roll)
  if (roll == '') return;

  if (selectedAction == 'absent') {
    presentRolls[index] = ''
    absentRolls[roll] = index

  }
  else {
    if (!omrMistakeRolls.includes(roll)) omrMistakeRolls.push(roll)
  }
  updateCounts()

}

const cancelAbsent = (roll, index) => {
  // console.log(roll, index)
  presentRolls[index] = roll
  delete absentRolls[roll]
  updateCounts()
}

const removeOmr = (roll, index) => {
  omrMistakeRolls.splice(index, 1)
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
