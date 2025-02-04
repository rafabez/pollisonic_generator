/* 
   Global settings:
   - Global effects (delay/reverb) are applied from the master volume node.
   - The master “tempo” control is labeled “Tempo Twist” (without numeric labels).
   - The Bass module now has a higher filter cutoff for a more pronounced sound.
   - The Lead module is restored as a high-tech, psychedelic lead synth.
   - All module outputs connect directly into the global effects chain.
   - A Stop button is added to each module to stop its loop independently.
*/

// Simple logger
function logMessage(msg) {
  console.log(msg);
  const consolePane = document.getElementById("consolePane");
  const div = document.createElement("div");
  div.className = "consoleMessage";
  div.textContent = msg;
  consolePane.appendChild(div);
  consolePane.scrollTop = consolePane.scrollHeight;
}

// Create master volume and global effects chain
const masterVolumeNode = new Tone.Volume(0);
const globalDelay = new Tone.FeedbackDelay("8n", 0.3);
const globalReverb = new Tone.Reverb({ decay: 0.8, preDelay: 0.01 });
masterVolumeNode.chain(globalDelay, globalReverb, Tone.Destination);

// Master UI controls
const masterVolumeSlider = document.getElementById("masterVolume");
masterVolumeSlider.addEventListener("input", (e) => {
  masterVolumeNode.volume.value = parseFloat(e.target.value);
  logMessage(`Master volume adjusted.`);
});

const masterTempoSlider = document.getElementById("masterTempo");
masterTempoSlider.addEventListener("input", (e) => {
  const newTempo = parseInt(e.target.value);
  Tone.Transport.bpm.value = newTempo;
  logMessage(`Tempo Twist adjusted.`);
});

const globalDelaySlider = document.getElementById("globalDelay");
globalDelaySlider.addEventListener("input", (e) => {
  globalDelay.delayTime.value = parseFloat(e.target.value);
  logMessage(`Global Delay Time adjusted.`);
});

const globalReverbSlider = document.getElementById("globalReverb");
globalReverbSlider.addEventListener("input", (e) => {
  globalReverb.decay = parseFloat(e.target.value);
  logMessage(`Global Reverb Decay adjusted.`);
});

// Start Tone.Transport
Tone.Transport.start();
logMessage("Tone.Transport started.");

// Module configurations
const moduleConfigs = [
  {
    title: "Beat",
    createInstrument: () => {
      logMessage("Creating Beat kit...");
      return {
        kick: new Tone.MembraneSynth({ volume: -6, envelope: { attack: 0.001, decay: 0.4 } }),
        snare: new Tone.NoiseSynth({ volume: -6, envelope: { attack: 0.001, decay: 0.2, sustain: 0, release: 0.1 } }),
        hihat: new Tone.MetalSynth({ volume: -6, frequency: 4000, envelope: { attack: 0.001, decay: 0.1, sustain: 0, release: 0.1 } })
      };
    },
    customControls: [
      {
        label: "KickDec",
        type: "range",
        min: "0.1", max: "2", step: "0.1", value: "0.4",
        onChange: (kit, val) => {
          kit.kick.envelope.decay = parseFloat(val);
          logMessage(`Beat KickDec changed to: ${val}`);
        }
      }
    ],
    transformNotesToBeat: true
  },
  {
    title: "Bass",
    createInstrument: () => {
      logMessage("Creating Bass synth...");
      return new Tone.MonoSynth({
        volume: -3,
        oscillator: { type: "fatsawtooth", count: 3, spread: 20 },
        filter: {
          type: "lowpass",
          frequency: 1000,
          rolloff: -24
        },
        envelope: {
          attack: 0.02,
          decay: 0.2,
          sustain: 0.4,
          release: 1
        },
        filterEnvelope: {
          attack: 0.001,
          decay: 0.2,
          sustain: 0.4,
          release: 1,
          baseFrequency: 80,
          octaves: 2
        }
      });
    },
    customControls: [
      {
        label: "Attack",
        type: "range",
        min: "0.01", max: "0.5", step: "0.01", value: "0.02",
        onChange: (inst, val) => {
          inst.envelope.attack = parseFloat(val);
          logMessage(`Bass Attack changed to: ${val}`);
        }
      },
      {
        label: "FreqEnv",
        type: "range",
        min: "1", max: "5", step: "0.1", value: "2",
        onChange: (inst, val) => {
          inst.filterEnvelope.octaves = parseFloat(val);
          logMessage(`Bass FreqEnv changed to: ${val}`);
        }
      }
    ]
  },
  {
    title: "Pad",
    createInstrument: () => {
      logMessage("Creating Pad poly-synth...");
      return new Tone.PolySynth(Tone.Synth, {
        volume: -10,
        oscillator: { type: "sine" },
        envelope: { attack: 1, decay: 2, sustain: 0.7, release: 3 }
      });
    },
    customControls: [
      {
        label: "OscType",
        type: "select",
        options: ["sine", "triangle", "square", "sawtooth"],
        value: "sine",
        onChange: (inst, val) => {
          inst.set({ oscillator: { type: val } });
          logMessage(`Pad OscType changed to: ${val}`);
        }
      },
      {
        label: "Sustain",
        type: "range",
        min: "0.1", max: "1", step: "0.1", value: "0.7",
        onChange: (inst, val) => {
          inst.set({ envelope: { sustain: parseFloat(val) } });
          logMessage(`Pad Sustain changed to: ${val}`);
        }
      },
      {
        label: "Release",
        type: "range",
        min: "0.5", max: "5", step: "0.1", value: "3",
        onChange: (inst, val) => {
          inst.set({ envelope: { release: parseFloat(val) } });
          logMessage(`Pad Release changed to: ${val}`);
        }
      }
    ]
  },
  {
    title: "Lead",
    createInstrument: () => {
      logMessage("Creating Lead high-tech synth...");
      const leadSynth = new Tone.Synth({
        volume: -10,
        oscillator: { type: "sawtooth" },
        envelope: { attack: 0.05, decay: 0.1, sustain: 0.7, release: 0.8 }
      });
      const filter = new Tone.Filter(2000, "lowpass");
      const distortion = new Tone.Distortion(0.4);
      leadSynth.connect(filter);
      filter.connect(distortion);
      return { synth: leadSynth, filter, distortion };
    },
    customControls: [
      {
        label: "Filter",
        type: "range",
        min: "200", max: "8000", step: "100", value: "2000",
        onChange: (obj, val) => {
          obj.filter.frequency.value = parseFloat(val);
          logMessage(`Lead Filter changed to: ${val}`);
        }
      },
      {
        label: "Distort",
        type: "range",
        min: "0", max: "1", step: "0.01", value: "0.4",
        onChange: (obj, val) => {
          obj.distortion.distortion = parseFloat(val);
          logMessage(`Lead Distortion changed to: ${val}`);
        }
      }
    ]
  },
  {
    title: "Glitch",
    createInstrument: () => {
      logMessage("Creating Glitch metal-synth...");
      return new Tone.MetalSynth({
        volume: -12,
        frequency: 100,
        modulationIndex: 10,
        resonance: 4000,
        harmonicity: 5.1,
        envelope: { attack: 0.001, decay: 1.0, sustain: 0.1, release: 2 }
      });
    },
    customControls: [
      {
        label: "Freq",
        type: "range",
        min: "50", max: "2000", step: "50", value: "100",
        onChange: (inst, val) => {
          inst.frequency.value = parseFloat(val);
          logMessage(`Glitch Freq changed to: ${val}`);
        }
      },
      {
        label: "ModIdx",
        type: "range",
        min: "1", max: "50", step: "1", value: "10",
        onChange: (inst, val) => {
          inst.modulationIndex = parseInt(val);
          logMessage(`Glitch ModIdx changed to: ${val}`);
        }
      },
      {
        label: "Reson",
        type: "range",
        min: "200", max: "8000", step: "100", value: "4000",
        onChange: (inst, val) => {
          inst.resonance = parseFloat(val);
          logMessage(`Glitch Reson changed to: ${val}`);
        }
      }
    ],
    randomizeOnTrigger: (inst) => {
      const rFreq = 50 + Math.random() * 1950;
      const rRes = 200 + Math.random() * 7800;
      inst.frequency.value = rFreq;
      inst.resonance = rRes;
      logMessage(`Glitch random param: freq=${rFreq.toFixed(1)}, resonance=${rRes.toFixed(1)}`);
    }
  }
];

// Build modules – each module connects directly to the masterVolumeNode
const modulesContainer = document.getElementById("modules");
const modules = [];

moduleConfigs.forEach(cfg => {
  modules.push(createModuleUI(cfg));
});

// Animate frequency visualization for each module
function animateAll() {
  requestAnimationFrame(animateAll);
  modules.forEach(mod => {
    const { analyser, freqCanvas } = mod;
    if (!analyser || !freqCanvas) return;
    const ctx = freqCanvas.getContext('2d');
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);
    ctx.clearRect(0, 0, freqCanvas.width, freqCanvas.height);
    const barWidth = freqCanvas.width / bufferLength;
    for (let i = 0; i < bufferLength; i++) {
      const barHeight = (dataArray[i] / 255) * freqCanvas.height;
      ctx.fillStyle = "#0f0";
      const x = i * barWidth;
      const y = freqCanvas.height - barHeight;
      ctx.fillRect(x, y, barWidth, barHeight);
    }
  });
}
requestAnimationFrame(animateAll);

function createModuleUI(config) {
  // Create instrument
  const instrumentEntity = config.createInstrument();
  let finalNode = null;
  if (instrumentEntity.kick && instrumentEntity.snare && instrumentEntity.hihat) {
    // Drum kit: connect each voice individually
  } else if (instrumentEntity.synth && instrumentEntity.filter && instrumentEntity.distortion) {
    finalNode = instrumentEntity.distortion;
  } else {
    finalNode = instrumentEntity;
  }
  
  // Create per-module volume and analyser node
  const moduleVolume = new Tone.Volume(-12).connect(masterVolumeNode);
  const moduleAnalyser = Tone.context.createAnalyser();
  moduleAnalyser.fftSize = 128;
  
  // Connect instrument output
  if (instrumentEntity.kick && instrumentEntity.snare && instrumentEntity.hihat) {
    instrumentEntity.kick.connect(moduleVolume);
    instrumentEntity.snare.connect(moduleVolume);
    instrumentEntity.hihat.connect(moduleVolume);
  } else {
    finalNode.connect(moduleVolume);
  }
  moduleVolume.input.connect(moduleAnalyser);
  
  // Build module card UI – added a Stop button below Generate.
  const div = document.createElement('div');
  div.classList.add('module');
  const ledId = `led-${config.title}`;
  div.innerHTML = `
    <div class="module-title">
      <span>${config.title}</span>
      <span id="${ledId}" class="ledCircle red"></span>
    </div>
    <label>Prompt</label>
    <input type="text" class="prompt" placeholder="Enter prompt" />
    <button class="generateBtn">Generate</button>
    <button class="stopBtn">Stop</button>
    <div class="knob-group">
      <label>Volume</label>
      <input type="range" class="moduleVol" min="-60" max="0" step="1" value="-12" />
      <div class="knob-row">
        <label>Detune</label>
        <input type="range" class="detuneKnob" min="-1200" max="1200" step="1" value="0" />
      </div>
      <div class="knob-row">
        <label>Attack</label>
        <input type="range" class="attackKnob" min="0.01" max="2" step="0.01" value="0.2" />
      </div>
      <div class="knob-row">
        <label>Decay</label>
        <input type="range" class="decayKnob" min="0.01" max="3" step="0.01" value="0.3" />
      </div>
      ${buildCustomControls(config.customControls)}
    </div>
    <div class="module-bottom">
      <button class="randomBtn">Randomize</button>
      <canvas class="freqCanvas"></canvas>
    </div>
  `;
  modulesContainer.appendChild(div);
  
  const ledEl = div.querySelector(`#${ledId}`);
  const promptEl = div.querySelector('.prompt');
  const generateBtn = div.querySelector('.generateBtn');
  const stopBtn = div.querySelector('.stopBtn');
  const randomBtn = div.querySelector('.randomBtn');
  const volSlider = div.querySelector('.moduleVol');
  const detuneKnob = div.querySelector('.detuneKnob');
  const attackKnob = div.querySelector('.attackKnob');
  const decayKnob = div.querySelector('.decayKnob');
  const freqCanvas = div.querySelector('.freqCanvas');
  
  function resizeCanvas() {
    freqCanvas.width = freqCanvas.clientWidth;
    freqCanvas.height = freqCanvas.clientHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  
  function setLedRed() {
    ledEl.classList.remove('yellow','green');
    ledEl.classList.add('red');
  }
  function setLedYellow() {
    ledEl.classList.remove('red','green');
    ledEl.classList.add('yellow');
  }
  function setLedGreen() {
    ledEl.classList.remove('red','yellow');
    ledEl.classList.add('green');
  }
  setLedRed();
  
  // Module knob watchers
  volSlider.addEventListener('input', e => {
    moduleVolume.volume.value = parseFloat(e.target.value);
  });
  detuneKnob.addEventListener('input', e => {
    const val = parseFloat(e.target.value);
    if (instrumentEntity.kick) {
      if (instrumentEntity.kick.detune !== undefined) instrumentEntity.kick.detune.value = val;
      if (instrumentEntity.snare.detune !== undefined) instrumentEntity.snare.detune.value = val;
      if (instrumentEntity.hihat.detune !== undefined) instrumentEntity.hihat.detune.value = val;
    } else if (instrumentEntity.detune !== undefined) {
      instrumentEntity.detune.value = val;
    } else if (instrumentEntity.synth) {
      instrumentEntity.synth.detune.value = val;
    }
  });
  attackKnob.addEventListener('input', e => {
    const val = parseFloat(e.target.value);
    if (instrumentEntity.kick) {
      instrumentEntity.kick.envelope.attack = val;
      instrumentEntity.snare.envelope.attack = val;
      instrumentEntity.hihat.envelope.attack = val;
    } else if (instrumentEntity.envelope) {
      instrumentEntity.envelope.attack = val;
    } else if (instrumentEntity.set) {
      instrumentEntity.set({ envelope: { attack: val } });
    } else if (instrumentEntity.synth) {
      instrumentEntity.synth.envelope.attack = val;
    }
  });
  decayKnob.addEventListener('input', e => {
    const val = parseFloat(e.target.value);
    if (instrumentEntity.kick) {
      instrumentEntity.kick.envelope.decay = val;
      instrumentEntity.snare.envelope.decay = val;
      instrumentEntity.hihat.envelope.decay = val;
    } else if (instrumentEntity.envelope) {
      instrumentEntity.envelope.decay = val;
    } else if (instrumentEntity.set) {
      instrumentEntity.set({ envelope: { decay: val } });
    } else if (instrumentEntity.synth) {
      instrumentEntity.synth.envelope.decay = val;
    }
  });
  
  // Custom controls for the module
  const paramElems = div.querySelectorAll(".custParam");
  const selectElems = div.querySelectorAll(".custSelect");
  if (config.customControls) {
    let pIndex = 0, sIndex = 0;
    config.customControls.forEach(ctrl => {
      if (ctrl.type === "select") {
        const sel = selectElems[sIndex++];
        sel.value = ctrl.value || sel.value;
        sel.addEventListener('change', e => {
          ctrl.onChange(instrumentEntity, e.target.value);
        });
      } else {
        const pe = paramElems[pIndex++];
        pe.addEventListener('input', e => {
          ctrl.onChange(instrumentEntity, e.target.value);
        });
      }
    });
  }
  
  // Randomize button
  randomBtn.addEventListener('click', () => {
    const rDetune = Math.round(Math.random() * 2400 - 1200);
    detuneKnob.value = rDetune;
    if (instrumentEntity.kick) {
      if (instrumentEntity.kick.detune !== undefined) instrumentEntity.kick.detune.value = rDetune;
      if (instrumentEntity.snare.detune !== undefined) instrumentEntity.snare.detune.value = rDetune;
      if (instrumentEntity.hihat.detune !== undefined) instrumentEntity.hihat.detune.value = rDetune;
    } else if (instrumentEntity.detune !== undefined) {
      instrumentEntity.detune.value = rDetune;
    } else if (instrumentEntity.synth) {
      instrumentEntity.synth.detune.value = rDetune;
    }
    const rAtk = (0.01 + Math.random() * 1.99).toFixed(2);
    attackKnob.value = rAtk;
    if (instrumentEntity.kick) {
      instrumentEntity.kick.envelope.attack = parseFloat(rAtk);
      instrumentEntity.snare.envelope.attack = parseFloat(rAtk);
      instrumentEntity.hihat.envelope.attack = parseFloat(rAtk);
    } else if (instrumentEntity.envelope) {
      instrumentEntity.envelope.attack = parseFloat(rAtk);
    } else if (instrumentEntity.set) {
      instrumentEntity.set({ envelope: { attack: parseFloat(rAtk) } });
    } else if (instrumentEntity.synth) {
      instrumentEntity.synth.envelope.attack = parseFloat(rAtk);
    }
    const rDec = (0.01 + Math.random() * 2.99).toFixed(2);
    decayKnob.value = rDec;
    if (instrumentEntity.kick) {
      instrumentEntity.kick.envelope.decay = parseFloat(rDec);
      instrumentEntity.snare.envelope.decay = parseFloat(rDec);
      instrumentEntity.hihat.envelope.decay = parseFloat(rDec);
    } else if (instrumentEntity.envelope) {
      instrumentEntity.envelope.decay = parseFloat(rDec);
    } else if (instrumentEntity.set) {
      instrumentEntity.set({ envelope: { decay: parseFloat(rDec) } });
    } else if (instrumentEntity.synth) {
      instrumentEntity.synth.envelope.decay = parseFloat(rDec);
    }
    if (config.customControls) {
      let pIndex2 = 0, sIndex2 = 0;
      config.customControls.forEach(ctrl => {
        if (ctrl.type === "select") {
          const sel = selectElems[sIndex2++];
          const randomOpt = ctrl.options[Math.floor(Math.random() * ctrl.options.length)];
          sel.value = randomOpt;
          ctrl.onChange(instrumentEntity, randomOpt);
        } else {
          const pe = paramElems[pIndex2++];
          const minVal = parseFloat(ctrl.min);
          const maxVal = parseFloat(ctrl.max);
          const rangeVal = minVal + Math.random() * (maxVal - minVal);
          const step = parseFloat(ctrl.step) || 1;
          const valRounded = (Math.round(rangeVal / step) * step).toFixed(2);
          pe.value = valRounded;
          ctrl.onChange(instrumentEntity, valRounded);
        }
      });
    }
  });
  
  // Generate button: schedules a Tone.Part for the module.
  let currentPart = null;
  generateBtn.addEventListener('click', async () => {
    if (currentPart) {
      currentPart.stop();
      currentPart.dispose();
      currentPart = null;
    }
    setLedRed();
    const prompt = promptEl.value.trim();
    if (!prompt) {
      logMessage(`[${config.title}] No prompt input`);
      return;
    }
    logMessage(`[${config.title}] Generating notation...`);
    try {
      const resp = await fetch("https://text.pollinations.ai/openai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            { role: "system", content: "You are a helpful assistant." },
            { role: "user", content: prompt }
          ],
          seed: 42,
          model: "midijourney"
        })
      });
      if (!resp.ok) {
        logMessage(`[${config.title}] Server error: ${resp.status}`);
        return;
      }
      const data = await resp.json();
      let rawContent = data.content 
        || (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content)
        || JSON.stringify(data);
      logMessage(`[${config.title}] Response:\n${rawContent}`);
      const notationRegex = /notation:\s*\|-\s*\n([\s\S]*)/i;
      const match = rawContent.match(notationRegex);
      if (!match) {
        logMessage(`[${config.title}] No notation block found.`);
        return;
      }
      let lines = match[1].split("\n").map(x => x.trim()).filter(x => x !== "");
      if (lines.length && lines[0].toLowerCase().startsWith("pitch")) lines.shift();
      let notes = lines.map(line => {
        const p = line.split(",");
        return {
          pitch: parseInt(p[0]),
          time: parseFloat(p[1]),
          duration: parseFloat(p[2]),
          velocity: parseInt(p[3])
        };
      });
      if (config.transformNotesToBeat) {
        notes = transformNotesIntoBeat(notes);
      }
      notes.sort((a, b) => a.time - b.time);
      for (let i = 1; i < notes.length; i++) {
        if (notes[i].time <= notes[i - 1].time) {
          notes[i].time = notes[i - 1].time + 0.001;
        }
      }
      const lastBeat = Math.max(...notes.map(n => n.time + n.duration));
      const loopBeats = lastBeat + 1;
      await Tone.start();
      logMessage(`[${config.title}] Scheduling Part length = ${loopBeats} beats.`);
      currentPart = new Tone.Part((playTime, nDat) => {
        const noteName = Tone.Frequency(nDat.pitch, "midi").toNote();
        const vel = nDat.velocity / 127;
        if (instrumentEntity.kick && instrumentEntity.snare && instrumentEntity.hihat) {
          if (nDat.pitch < 50) {
            instrumentEntity.kick.triggerAttackRelease("C2", nDat.duration, playTime, vel);
          } else if (nDat.pitch < 60) {
            instrumentEntity.snare.triggerAttackRelease("16n", playTime, vel);
          } else {
            instrumentEntity.hihat.triggerAttackRelease("16n", playTime, vel);
          }
        } else if (config.randomizeOnTrigger) {
          config.randomizeOnTrigger(instrumentEntity);
          if (instrumentEntity.synth) instrumentEntity.synth.triggerAttackRelease(noteName, nDat.duration, playTime, vel);
          else instrumentEntity.triggerAttackRelease(noteName, nDat.duration, playTime, vel);
        } else if (instrumentEntity.synth && instrumentEntity.filter && instrumentEntity.distortion) {
          instrumentEntity.synth.triggerAttackRelease(noteName, nDat.duration, playTime, vel);
        } else {
          instrumentEntity.triggerAttackRelease(noteName, nDat.duration, playTime, vel);
        }
      }, notes.map(x => [x.time, x]));
      currentPart.loop = true;
      currentPart.loopEnd = loopBeats;
      setLedYellow();
      currentPart.start(0);
      Tone.Transport.start();
      setLedGreen();
      logMessage(`[${config.title}] Part started. loopEnd=${loopBeats}, notes=${notes.length}`);
    }
    catch (err) {
      logMessage(`[${config.title}] Error: ${err}`);
    }
  });
  
  // STOP button stops and disposes the current loop (if any) for this module.
  stopBtn.addEventListener('click', () => {
    if (currentPart) {
      currentPart.stop();
      currentPart.dispose();
      currentPart = null;
      logMessage(`[${config.title}] Loop stopped.`);
      setLedRed();
    }
  });
  
  return {
    analyser: moduleAnalyser,
    freqCanvas,
    instrumentEntity
  };
}

function transformNotesIntoBeat(original) {
  const lastTime = Math.max(...original.map(n => n.time + n.duration));
  const loopLen = lastTime + 1;
  const newNotes = [];
  let beat = 0;
  while (beat < loopLen) {
    newNotes.push({ pitch: 40, time: beat, duration: 0.5, velocity: 100 });
    if (Math.floor(beat) % 2 === 1) {
      newNotes.push({ pitch: 55, time: beat, duration: 0.5, velocity: 120 });
    }
    newNotes.push({ pitch: 70, time: beat + 0.5, duration: 0.3, velocity: 80 });
    beat++;
  }
  return newNotes;
}

function buildCustomControls(controls) {
  if (!controls) return '';
  let html = '';
  controls.forEach(ctrl => {
    if (ctrl.type === 'select') {
      const opts = ctrl.options.map(o => `<option value="${o}">${o}</option>`).join('');
      html += `
        <div class="knob-row">
          <label>${ctrl.label}</label>
          <select class="custSelect">${opts}</select>
        </div>`;
    } else {
      html += `
        <div class="knob-row">
          <label>${ctrl.label}</label>
          <input type="range" class="custParam" min="${ctrl.min}" max="${ctrl.max}" step="${ctrl.step}" value="${ctrl.value}" />
        </div>`;
    }
  });
  return html;
}
