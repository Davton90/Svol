<script>
    import { onMount, tick } from 'svelte';
    import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
    import { getAuth, signInWithCustomToken, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
    import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

    // --- CONSTANTS ---
    const TM = {
        'ONIC': 'ONIC', 'BTR': 'Bigetron Vitality', 'EVOS': 'EVOS',
        'DEWA': 'Dewa United Esports', 'TLID': 'Team Liquid ID', 'AE': 'Alter Ego',
        'GEEK': 'Geek Fam ID', 'NAVI': 'Natus Vincere', 'RRQ': 'RRQ Hoshi'
    };
    const TEAMS = Object.values(TM);
    
    const TEAM_ABBR = {
        'ONIC': 'ONIC', 'Bigetron Vitality': 'BTR', 'EVOS': 'EVOS',
        'Dewa United Esports': 'DEWA', 'Team Liquid ID': 'TLID', 'Alter Ego': 'AE',
        'Geek Fam ID': 'GEEK', 'Natus Vincere': 'NAVI', 'RRQ Hoshi': 'RRQ'
    };

    const LOGO_COLORS = {
        'ONIC': 'bg-yellow-400 text-black', 'Bigetron Vitality': 'bg-red-600 text-white', 
        'EVOS': 'bg-blue-600 text-white', 'Dewa United Esports': 'bg-black text-amber-400 border border-amber-400', 
        'Team Liquid ID': 'bg-blue-900 text-white', 'Alter Ego': 'bg-gray-800 text-white',
        'Geek Fam ID': 'bg-red-800 text-white', 'Natus Vincere': 'bg-yellow-500 text-black', 
        'RRQ Hoshi': 'bg-orange-500 text-black'
    };

    const history = [
        { w: 1, t1: 'BTR', t2: 'AE', s1: 2, s2: 1 }, { w: 1, t1: 'NAVI', t2: 'RRQ', s1: 2, s2: 0 },
        { w: 1, t1: 'EVOS', t2: 'GEEK', s1: 2, s2: 0 }, { w: 1, t1: 'AE', t2: 'ONIC', s1: 0, s2: 2 },
        { w: 1, t1: 'TLID', t2: 'NAVI', s1: 2, s2: 1 }, { w: 1, t1: 'DEWA', t2: 'BTR', s1: 2, s2: 0 },
        { w: 1, t1: 'EVOS', t2: 'TLID', s1: 0, s2: 2 }, { w: 1, t1: 'RRQ', t2: 'ONIC', s1: 0, s2: 2 },
        { w: 2, t1: 'ONIC', t2: 'GEEK', s1: 2, s2: 0 }, { w: 2, t1: 'DEWA', t2: 'NAVI', s1: 2, s2: 0 },
        { w: 2, t1: 'GEEK', t2: 'BTR', s1: 2, s2: 0 }, { w: 2, t1: 'AE', t2: 'EVOS', s1: 2, s2: 1 },
        { w: 2, t1: 'TLID', t2: 'DEWA', s1: 2, s2: 1 }, { w: 2, t1: 'NAVI', t2: 'AE', s1: 1, s2: 2 },
        { w: 2, t1: 'RRQ', t2: 'TLID', s1: 0, s2: 2 }, { w: 2, t1: 'BTR', t2: 'EVOS', s1: 2, s2: 1 },
        { w: 3, t1: 'ONIC', t2: 'DEWA', s1: 2, s2: 1 }, { w: 3, t1: 'NAVI', t2: 'EVOS', s1: 0, s2: 2 },
        { w: 3, t1: 'TLID', t2: 'GEEK', s1: 0, s2: 2 }, { w: 3, t1: 'ONIC', t2: 'BTR', s1: 1, s2: 2 },
        { w: 3, t1: 'RRQ', t2: 'AE', s1: 1, s2: 2 }, { w: 3, t1: 'BTR', t2: 'NAVI', s1: 1, s2: 2 },
        { w: 3, t1: 'GEEK', t2: 'RRQ', s1: 2, s2: 1 }, { w: 3, t1: 'AE', t2: 'DEWA', s1: 0, s2: 2 },
        { w: 4, t1: 'NAVI', t2: 'ONIC', s1: 0, s2: 2 }, { w: 4, t1: 'EVOS', t2: 'DEWA', s1: 2, s2: 0 },
        { w: 4, t1: 'TLID', t2: 'BTR', s1: 1, s2: 2 }, { w: 4, t1: 'RRQ', t2: 'EVOS', s1: 0, s2: 2 },
        { w: 4, t1: 'GEEK', t2: 'AE', s1: 1, s2: 2 }, { w: 4, t1: 'ONIC', t2: 'TLID', s1: 2, s2: 0 },
        { w: 4, t1: 'BTR', t2: 'RRQ', s1: 2, s2: 1 }, { w: 4, t1: 'DEWA', t2: 'GEEK', s1: 2, s2: 0 }
    ];

    const schedule = [
        { w: 5, m: [['GEEK', 'NAVI'], ['EVOS', 'ONIC'], ['DEWA', 'RRQ'], ['AE', 'TLID'], ['EVOS', 'BTR'], ['AE', 'NAVI'], ['GEEK', 'ONIC'], ['DEWA', 'TLID']] },
        { w: 6, m: [['NAVI', 'DEWA'], ['AE', 'GEEK'], ['EVOS', 'AE'], ['TLID', 'ONIC'], ['RRQ', 'BTR'], ['NAVI', 'TLID'], ['ONIC', 'RRQ'], ['GEEK', 'EVOS']] },
        { w: 7, m: [['GEEK', 'DEWA'], ['BTR', 'TLID'], ['DEWA', 'AE'], ['EVOS', 'RRQ'], ['ONIC', 'NAVI'], ['RRQ', 'GEEK'], ['NAVI', 'BTR'], ['TLID', 'EVOS']] },
        { w: 8, m: [['BTR', 'GEEK'], ['DEWA', 'ONIC'], ['EVOS', 'NAVI'], ['TLID', 'RRQ'], ['ONIC', 'AE'], ['DEWA', 'EVOS'], ['AE', 'BTR'], ['RRQ', 'NAVI']] },
        { w: 9, m: [['BTR', 'DEWA'], ['TLID', 'AE'], ['GEEK', 'TLID'], ['AE', 'RRQ'], ['BTR', 'ONIC'], ['RRQ', 'DEWA'], ['ONIC', 'EVOS'], ['NAVI', 'GEEK']] }
    ];

    const TEAM_ALIASES = {
        'ONIC': ['onic', 'fnoc', 'fnatic'],
        'Bigetron Vitality': ['btr', 'bigetron', 'vitality'],
        'EVOS': ['evos'],
        'Dewa United Esports': ['dewa'],
        'Team Liquid ID': ['tlid', 'liquid', 'teamliquid'],
        'Alter Ego': ['ae', 'alter', 'alterego'],
        'Geek Fam ID': ['geek'],
        'Natus Vincere': ['navi', 'natus'],
        'RRQ Hoshi': ['rrq', 'hoshi']
    };

    // --- STATE ---
    let state = [];
    let curWeek = 1;
    let probs = {};
    let highlightedTeam = null;
    let focusFilter = 'all';
    let teamLogos = {};
    let sortCol = 'default';
    let sortAsc = true;
    
    let isCalculating = false;
    let syncStatus = "Connecting...";
    let syncColor = "text-slate-400";
    
    let toastMsg = "";
    let showToast = false;
    let isToastError = false;

    let insightCache = {};
    let currentAiInsight = null;
    let isAiLoading = false;

    let matchScrollArea;

    let db, auth, currentUser, appId;

    // --- REACTIVE DECLARATIONS ---
    // Re-calculate standings anytime `state` changes
    $: baseList = calculate(state);
    
    // Assign trueRank and apply sorting
    $: sortedList = (() => {
        let temp = [...baseList];
        temp.forEach((t, i) => t.trueRank = i + 1);

        if (sortCol !== 'default') {
            temp.sort((a, b) => {
                let valA = parseFloat(probs[a.n]?.[sortCol] || 0);
                let valB = parseFloat(probs[b.n]?.[sortCol] || 0);
                if (valA === valB) return a.trueRank - b.trueRank; 
                return sortAsc ? valA - valB : valB - valA;
            });
        } else if (!sortAsc) {
            temp.reverse();
        }
        return temp;
    })();

    // Dashboard Derived Data
    $: activeTeamData = highlightedTeam ? sortedList.find(t => t.n === highlightedTeam) : null;
    $: winRate = (activeTeamData && (activeTeamData.mw + activeTeamData.ml > 0)) ? Math.round((activeTeamData.mw / (activeTeamData.mw + activeTeamData.ml)) * 100) : 0;
    
    $: teamMatchesRaw = state.filter(m => m.t1 === highlightedTeam || m.t2 === highlightedTeam);
    $: upcomingMatchesAll = teamMatchesRaw.filter(m => !m.fixed);
    $: remOpponents = upcomingMatchesAll.map(m => m.t1 === highlightedTeam ? m.t2 : m.t1);
    
    $: sosStats = (() => {
        let diffScore = 0;
        remOpponents.forEach(opp => {
            let oppData = sortedList.find(x => x.n === opp);
            if(oppData && (oppData.mw + oppData.ml > 0)) diffScore += oppData.mw / (oppData.mw + oppData.ml);
        });
        let avgDiff = remOpponents.length > 0 ? (diffScore / remOpponents.length) : 0;
        let label = "Mudah", color = "text-emerald-400";
        if(remOpponents.length === 0) { label = "Selesai"; color = "text-slate-500"; }
        else if (avgDiff >= 0.55) { label = "Sangat Sulit"; color = "text-red-500"; }
        else if (avgDiff >= 0.45) { label = "Sulit"; color = "text-orange-400"; }
        else if (avgDiff >= 0.35) { label = "Sedang"; color = "text-yellow-400"; }
        return { label, color };
    })();

    // Reactive Match List for rendering
    $: displayMatches = getDisplayMatches(state, highlightedTeam, focusFilter, sortedList);

    // Watcher for Auto-Scroll and AI Insight generation
    let prevHighlight = null;
    $: if (highlightedTeam !== prevHighlight) {
        prevHighlight = highlightedTeam;
        if (highlightedTeam) {
            triggerAiInsight(highlightedTeam);
            setTimeout(() => {
                const el = document.getElementById('focus-upcoming-header');
                if (el && matchScrollArea) {
                    matchScrollArea.scrollTo({ top: el.offsetTop - 80, behavior: 'smooth' });
                }
            }, 50);
        } else {
            currentAiInsight = null;
        }
    }


    // --- INITIALIZATION ---
    onMount(() => {
        initBaseState();
        fetchLogos();
        initFirebase();
    });

    function initBaseState() {
        let tempState = [];
        let id = 1;
        history.forEach(m => tempState.push({id: id++, w: m.w, t1: TM[m.t1], t2: TM[m.t2], s1: m.s1, s2: m.s2, fixed: true}));
        schedule.forEach(wf => wf.m.forEach(match => tempState.push({id: id++, w: wf.w, t1: TM[match[0]], t2: TM[match[1]], s1: null, s2: null, fixed: false})));
        state = tempState;

        TEAMS.forEach(t => probs[t] = {upper: 0, playin: 0, playoff: 0, elim: 0});
        determineCurrentWeek();
        runSimulation();
    }

    function determineCurrentWeek() {
        let unplayedMatch = state.find(m => m.s1 === null);
        if (unplayedMatch) {
            curWeek = unplayedMatch.w;
        } else {
            curWeek = Math.max(...state.map(m => m.w));
        }
    }

    async function fetchLogos() {
        try {
            const res = await fetch('https://api.github.com/repos/Davton90/mplddd/contents/mpl_id_team_icon');
            if(!res.ok) return;
            const data = await res.json();
            if(Array.isArray(data)) {
                data.forEach(file => {
                    let cleanFilename = file.name.toLowerCase().replace(/[^a-z0-9]/g, '');
                    for(let teamName in TEAM_ALIASES) {
                        if(TEAM_ALIASES[teamName].some(alias => cleanFilename.includes(alias.replace(/[^a-z0-9]/g, '')))) {
                            teamLogos[teamName] = file.download_url;
                        }
                    }
                });
                teamLogos = {...teamLogos}; // trigger reactivity
            }
        } catch(e) {}
    }

    async function initFirebase() {
        try {
            const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : null;
            if (!firebaseConfig || Object.keys(firebaseConfig).length === 0) {
                updateSync("Local/Offline", "text-slate-400");
                return;
            }
            
            const app = initializeApp(firebaseConfig);
            auth = getAuth(app);
            db = getFirestore(app);
            appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

            if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) await signInWithCustomToken(auth, __initial_auth_token);
            else await signInAnonymously(auth);

            onAuthStateChanged(auth, async (user) => {
                currentUser = user;
                if (user) await loadDataFromCloud();
            });
        } catch(e) {
            updateSync("Offline", "text-slate-400");
        }
    }

    async function loadDataFromCloud() {
        if (!currentUser || !db) return;
        try {
            const docRef = doc(db, 'artifacts', appId, 'users', currentUser.uid, 'predictions', 'saved_state');
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const savedData = docSnap.data().matches;
                state = state.map(m => {
                    const sm = savedData.find(x => x.id === m.id);
                    if (sm && !m.fixed) { return { ...m, s1: sm.s1, s2: sm.s2 }; }
                    return m;
                });
                determineCurrentWeek();
                runSimulation();
            }
            updateSync("Cloud Synced", "text-emerald-400");
        } catch (e) {
            updateSync("Sync Failed", "text-red-400");
        }
    }

    async function saveToCloud() {
        if (!currentUser || !db) return;
        updateSync("Saving...", "text-amber-400");
        try {
            const dataToSave = state.filter(m => !m.fixed).map(m => ({ id: m.id, s1: m.s1, s2: m.s2 }));
            const docRef = doc(db, 'artifacts', appId, 'users', currentUser.uid, 'predictions', 'saved_state');
            await setDoc(docRef, { matches: dataToSave });
            updateSync("Cloud Saved", "text-emerald-400");
        } catch (e) {
            updateSync("Save Failed", "text-red-400");
        }
    }

    function updateSync(msg, color) {
        syncStatus = msg;
        syncColor = color;
    }

    // --- LOGIC FUNCTIONS ---
    function calculate(matches) {
        let s = {};
        TEAMS.forEach(t => s[t] = {n: t, mw: 0, ml: 0, gw: 0, gl: 0, h2h: {}, form: []});
        TEAMS.forEach(t1 => TEAMS.forEach(t2 => s[t1].h2h[t2] = 0));

        matches.forEach(m => {
            if(m.s1 !== null && m.s2 !== null) {
                s[m.t1].gw += m.s1; s[m.t1].gl += m.s2;
                s[m.t2].gw += m.s2; s[m.t2].gl += m.s1;
                
                if(m.s1 > m.s2) { 
                    s[m.t1].mw++; s[m.t2].ml++; 
                    s[m.t1].h2h[m.t2]++; 
                    s[m.t1].form.push({ res: 'W', opp: m.t2 }); 
                    s[m.t2].form.push({ res: 'L', opp: m.t1 });
                } else { 
                    s[m.t2].mw++; s[m.t1].ml++; 
                    s[m.t2].h2h[m.t1]++; 
                    s[m.t2].form.push({ res: 'W', opp: m.t1 }); 
                    s[m.t1].form.push({ res: 'L', opp: m.t2 });
                }
            }
        });

        TEAMS.forEach(t => { s[t].form = s[t].form.slice(-5); });

        return Object.values(s).sort((a,b) => {
            if(b.mw !== a.mw) return b.mw - a.mw;
            let gdA = a.gw - a.gl, gdB = b.gw - b.gl;
            if(gdB !== gdA) return gdB - gdA;
            let h2hDiff = b.h2h[a.n] - a.h2h[b.n];
            if(h2hDiff !== 0) return h2hDiff;
            return a.n.localeCompare(b.n);
        });
    }

    function runSimulation() {
        const iterations = 50000; 
        let counts = {};
        TEAMS.forEach(t => counts[t] = {upper: 0, playin: 0, playoff: 0, elim: 0});

        let seed = getStateSeed();
        let seededRandom = mulberry32(seed);

        for(let i=0; i<iterations; i++) {
            let simMatches = state.map(m => {
                if(m.s1 !== null) return m;
                let win = seededRandom() > 0.5;
                let clean = seededRandom() > 0.5;
                return { ...m, s1: win ? 2 : (clean ? 0 : 1), s2: win ? (clean ? 0 : 1) : 2 };
            });

            let res = calculate(simMatches);
            res.forEach((t, idx) => {
                if(idx < 2) counts[t.n].upper++;
                if(idx >= 2 && idx < 6) counts[t.n].playin++;
                if(idx < 6) counts[t.n].playoff++;
                if(idx >= 6) counts[t.n].elim++;
            });
        }

        let tempProbs = {};
        TEAMS.forEach(t => {
            tempProbs[t] = {
                upper: (counts[t].upper / iterations * 100).toFixed(2),
                playin: (counts[t].playin / iterations * 100).toFixed(2),
                playoff: (counts[t].playoff / iterations * 100).toFixed(2),
                elim: (counts[t].elim / iterations * 100).toFixed(2)
            };
        });
        probs = tempProbs; // Trigger reactivity
    }

    function triggerCalculation() {
        isCalculating = true;
        setTimeout(() => {
            runSimulation();
            saveToCloud();
            isCalculating = false;
        }, 10);
    }

    // --- EVENT HANDLERS ---
    function handleSort(col) {
        if (sortCol === col) sortAsc = !sortAsc;
        else { sortCol = col; sortAsc = col === 'default'; }
    }

    function toggleHighlight(teamName) {
        highlightedTeam = (highlightedTeam === teamName) ? null : teamName;
        focusFilter = 'all';
    }

    function setFocusFilter(f) { focusFilter = f; }
    function changeWeek(w) { curWeek = w; }

    function setDropdownScore(id, team, valStr) {
        let val = parseInt(valStr);
        state = state.map(m => {
            if (m.id === id) {
                let newM = {...m};
                if (team === 1) {
                    newM.s1 = val;
                    if (val === 2) { if (newM.s2 === 2 || newM.s2 === null) newM.s2 = 0; } 
                    else if (val === 1 || val === 0) newM.s2 = 2;
                } else {
                    newM.s2 = val;
                    if (val === 2) { if (newM.s1 === 2 || newM.s1 === null) newM.s1 = 0; } 
                    else if (val === 1 || val === 0) newM.s1 = 2;
                }
                return newM;
            }
            return m;
        });
        triggerCalculation();
    }

    function clearMatch(id) {
        state = state.map(m => (m.id === id && !m.fixed) ? { ...m, s1: null, s2: null } : m);
        triggerCalculation();
    }

    function clearCurrentWeek() {
        state = state.map(m => (m.w === curWeek && !m.fixed) ? { ...m, s1: null, s2: null } : m);
        triggerCalculation();
    }

    function randomizeCurrentWeek() {
        state = state.map(m => {
            if(!m.fixed && m.w === curWeek && m.s1 === null) {
                let win = Math.random() > 0.5; let clean = Math.random() > 0.5;
                return { ...m, s1: win ? 2 : (clean ? 0 : 1), s2: win ? (clean ? 0 : 1) : 2 };
            }
            return m;
        });
        triggerCalculation();
    }

    function randomizeRemaining() {
        state = state.map(m => {
            if(!m.fixed && m.s1 === null) {
                let win = Math.random() > 0.5; let clean = Math.random() > 0.5;
                return { ...m, s1: win ? 2 : (clean ? 0 : 1), s2: win ? (clean ? 0 : 1) : 2 };
            }
            return m;
        });
        insightCache = {};
        triggerCalculation();
    }

    function resetSim() {
        state = state.map(m => !m.fixed ? { ...m, s1: null, s2: null } : m);
        insightCache = {};
        determineCurrentWeek(); 
        triggerCalculation();
    }

    // --- SCENARIOS ---
    function saveLocalScenario(slotNum) {
        const dataToSave = state.filter(m => !m.fixed).map(m => ({ id: m.id, s1: m.s1, s2: m.s2 }));
        localStorage.setItem(`mpl_id_scenario_slot_${slotNum}`, JSON.stringify(dataToSave));
        triggerToast(`Prediksi berhasil disimpan ke Slot ${slotNum}`);
    }

    function loadLocalScenario(slotNum) {
        const savedStr = localStorage.getItem(`mpl_id_scenario_slot_${slotNum}`);
        if(savedStr) {
            const savedData = JSON.parse(savedStr);
            state = state.map(m => {
                const sm = savedData.find(x => x.id === m.id);
                return (sm && !m.fixed) ? { ...m, s1: sm.s1, s2: sm.s2 } : m;
            });
            triggerCalculation();
            triggerToast(`Memuat Skenario dari Slot ${slotNum}`);
        } else {
            triggerToast(`Slot ${slotNum} masih kosong!`, true);
        }
    }

    function triggerToast(msg, isError = false) {
        toastMsg = msg;
        isToastError = isError;
        showToast = true;
        setTimeout(() => showToast = false, 3000);
    }

    function shareStandings() {
        let text = "🔮 MPL ID S17 Predictor - Klasemen Saat Ini:\n\n";
        sortedList.forEach((t, i) => {
            let pUpper = parseFloat(probs[t.n]?.upper || 0);
            let pPlayoff = parseFloat(probs[t.n]?.playoff || 0);
            let tag = pUpper === 100 ? " [U]" : (pPlayoff === 100 ? " [P]" : (pPlayoff === 0 ? " [E]" : ""));
            text += `${i+1}. ${t.n} (${t.mw}-${t.ml})${tag}\n`;
        });
        text += "\nBuat prediksimu sendiri!";
        
        const el = document.createElement('textarea');
        el.value = text;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
        triggerToast("Teks Prediksi Disalin ke Clipboard!");
    }

    // --- UTILITIES FOR TEMPLATE ---
    function getDisplayMatches(currentState, focusTeam, filter, currentList) {
        let matches = currentState;
        
        if (focusTeam) {
            matches = matches.filter(m => m.t1 === focusTeam || m.t2 === focusTeam);
            if (filter === 'win') {
                matches = matches.filter(m => m.s1 !== null && m.s2 !== null && ((m.t1 === focusTeam && m.s1 > m.s2) || (m.t2 === focusTeam && m.s2 > m.s1)));
            } else if (filter === 'lose') {
                matches = matches.filter(m => m.s1 !== null && m.s2 !== null && ((m.t1 === focusTeam && m.s1 < m.s2) || (m.t2 === focusTeam && m.s2 < m.s1)));
            }
        } else {
            matches = matches.filter(m => m.w === curWeek);
        }

        return matches.map(m => {
            let h2hT1 = 0, h2hT2 = 0;
            currentState.forEach(x => {
                if (x.fixed && x.id !== m.id) {
                    if (x.t1 === m.t1 && x.t2 === m.t2) { if (x.s1 > x.s2) h2hT1++; else h2hT2++; }
                    else if (x.t1 === m.t2 && x.t2 === m.t1) { if (x.s2 > x.s1) h2hT1++; else h2hT2++; }
                }
            });

            let rankT1 = currentList.find(t => t.n === m.t1)?.trueRank || 0;
            let rankT2 = currentList.find(t => t.n === m.t2)?.trueRank || 0;
            let isCrucial = (!m.fixed && (rankT1 >= 3 && rankT1 <= 7) && (rankT2 >= 3 && rankT2 <= 7) && Math.abs(rankT1 - rankT2) <= 3);

            let focusResult = null;
            if (focusTeam && (m.s1 !== null || m.fixed)) {
                let focusScore = m.t1 === focusTeam ? m.s1 : m.s2;
                let oppScore = m.t1 === focusTeam ? m.s2 : m.s1;
                if (focusScore > oppScore) focusResult = 'WIN';
                else if (focusScore < oppScore) focusResult = 'LOSE';
            }

            let borderClass = 'border-slate-700 bg-[#121826] hover:bg-[#1a2333]'; 
            let isFocusCard = focusTeam && (m.t1 === focusTeam || m.t2 === focusTeam);
            let isRRQ = !isFocusCard && (m.t1 === 'RRQ Hoshi' || m.t2 === 'RRQ Hoshi');
            if (isFocusCard) borderClass = 'border-yellow-500/50 bg-yellow-900/10 hover:bg-yellow-900/20 shadow-[0_0_15px_rgba(234,179,8,0.05)]';
            else if (isRRQ) borderClass = 'border-orange-500/40 bg-orange-950/20 hover:bg-orange-950/30';

            return { ...m, h2hT1, h2hT2, isCrucial, focusResult, borderClass, isFocusCard };
        });
    }

    function applyBestCase(teamName) {
        state = state.map(m => {
            if (m.fixed || m.s1 !== null) return m;
            if (m.t1 === teamName || m.t2 === teamName) {
                let isHome = m.t1 === teamName;
                return { ...m, s1: isHome ? 2 : 0, s2: isHome ? 0 : 2 };
            }
            return m;
        });
        insightCache = {};
        triggerCalculation();
    }

    function applyWorstCase(teamName) {
        state = state.map(m => {
            if (m.fixed || m.s1 !== null) return m;
            if (m.t1 === teamName || m.t2 === teamName) {
                let isHome = m.t1 === teamName;
                return { ...m, s1: isHome ? 0 : 2, s2: isHome ? 2 : 0 };
            }
            return m;
        });
        insightCache = {};
        triggerCalculation();
    }

    // --- AI INSIGHT GENERATION ---
    async function triggerAiInsight(teamName) {
        let teamData = sortedList.find(t => t.n === teamName);
        if(!teamData) return;

        let seed = getStateSeed();
        let cacheKey = `${teamName}-${seed}`;
        
        if (insightCache[cacheKey]) {
            currentAiInsight = insightCache[cacheKey];
            return;
        }

        isAiLoading = true;
        currentAiInsight = null;

        // Calculate Magic Number
        const pPlayoff = parseFloat(probs[teamName].playoff);
        let magicNum = null;
        if (pPlayoff !== 100 && pPlayoff !== 0) {
            let remaining = state.filter(m => !m.fixed && (m.t1 === teamName || m.t2 === teamName)).length;
            for (let wins = 0; wins <= remaining; wins++) {
                let simState = state.map(m => {
                    if (m.fixed || (m.t1 !== teamName && m.t2 !== teamName)) return m;
                    if (m.s1 !== null) return m;
                    return { ...m };
                });
                let teamMatches = simState.filter(m => !m.fixed && m.s1 === null && (m.t1 === teamName || m.t2 === teamName));
                let filledIds = new Set();
                teamMatches.forEach((m, idx) => {
                    let isHome = m.t1 === teamName;
                    m.s1 = idx < wins ? (isHome ? 2 : 0) : (isHome ? 0 : 2);
                    m.s2 = idx < wins ? (isHome ? 0 : 2) : (isHome ? 2 : 0);
                    filledIds.add(m.id);
                });
                simState = simState.map(m => m.s1 === null ? { ...m, s1: 1, s2: 2 } : m);
                let res = calculate(simState);
                if (res.findIndex(t => t.n === teamName) < 6) { magicNum = wins; break; }
            }
            if(magicNum === null) magicNum = remaining;
        }

        const played = teamData.mw + teamData.ml;
        const remaining = 16 - played;
        const remOpp = state.filter(m => !m.fixed && m.s1 === null && (m.t1 === teamName || m.t2 === teamName)).map(m => m.t1 === teamName ? m.t2 : m.t1);
        const rivals = sortedList.filter(t => t.n !== teamName && (Math.abs(t.trueRank - teamData.trueRank) <= 2 || Math.abs(t.mw - teamData.mw) <= 1)).map(t => TEAM_ABBR[t.n] || t.n);
        const form5 = teamData.form.map(f => f.res).join('');
        const abbr = TEAM_ABBR[teamName] || teamName;

        let statusColor = 'from-blue-900/60 to-slate-900/80 border-blue-600/40';
        let statusLabel = `Peringkat ${teamData.trueRank}`;
        const pUpper = parseFloat(probs[teamName].upper);
        if (pPlayoff === 100 && pUpper === 100) { statusColor = 'from-amber-900/60 to-slate-900/80 border-amber-500/40'; statusLabel = '🔒 Upper Bracket'; }
        else if (pPlayoff === 100) { statusColor = 'from-emerald-900/60 to-slate-900/80 border-emerald-500/40'; statusLabel = '✅ Playoff Aman'; }
        else if (pPlayoff === 0) { statusColor = 'from-red-900/60 to-slate-900/80 border-red-500/40'; statusLabel = '❌ Tereliminasi'; }
        else if (pPlayoff >= 75) { statusColor = 'from-emerald-900/40 to-slate-900/80 border-emerald-600/30'; statusLabel = '🟢 Posisi Kuat'; }
        else if (pPlayoff >= 40) { statusColor = 'from-yellow-900/40 to-slate-900/80 border-yellow-600/30'; statusLabel = '🟡 Zona Bahaya'; }
        else { statusColor = 'from-red-900/40 to-slate-900/80 border-red-600/30'; statusLabel = '🔴 Butuh Keajaiban'; }

        let fallbackData = {
            abbr, rank: teamData.trueRank, mw: teamData.mw, ml: teamData.ml,
            remOppLength: remOpp.length, magicNum, pPlayoff, pUpper, pPlayin: probs[teamName].playin, pElim: probs[teamName].elim,
            form5, statusColor, statusLabel, teamName
        };

        try {
            const prompt = `Kamu adalah analis esports profesional MPL ID S17. Berikan analisis dalam Bahasa Indonesia yang tajam dan informatif untuk tim ${teamName} (singkatan: ${abbr}).
Data tim:
- Peringkat saat ini: ${teamData.trueRank} dari 9 tim
- Rekor: ${teamData.mw}W - ${teamData.ml}L (${played} pertandingan dimainkan)
- Game Diff: ${teamData.gw - teamData.gl > 0 ? '+' : ''}${teamData.gw - teamData.gl}
- Sisa pertandingan: ${remOpp.length} laga melawan [${remOpp.map(o => TEAM_ABBR[o]||o).join(', ')||'selesai'}]
- Form 5 terakhir: ${form5 || 'belum ada data'}
- Probabilitas Playoff: ${pPlayoff}%
- Probabilitas Upper Bracket: ${pUpper}%
- Magic Number untuk Playoff: ${magicNum === null ? (pPlayoff===100 ? 'Sudah aman' : 'Sudah tereliminasi') : magicNum+' kemenangan lagi'}
- Tim pesaing di klasemen: ${rivals.slice(0,4).join(', ')||'-'}
Format HANYA JSON: {"insights": ["insight 1 (maks 70 kata, gunakan angka dan fakta spesifik)", "insight 2 (maks 70 kata)", "insight 3 (maks 70 kata)", "insight 4 (maks 70 kata, prediksi)"]}`;

            const res = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 1000, messages: [{ role: 'user', content: prompt }] })
            });

            const data = await res.json();
            const rawText = data.content?.map(c => c.text || '').join('');
            let parsed;
            try { parsed = JSON.parse(rawText.replace(/```json|```/g, '').trim()); } 
            catch { parsed = { insights: [rawText] }; }

            insightCache[cacheKey] = { ...fallbackData, texts: parsed.insights || [] };
        } catch (err) {
            // Fallback Generator
            let texts = [];
            texts.push(`📊 ${abbr} berada di peringkat ${teamData.trueRank} dengan rekor ${teamData.mw}W-${teamData.ml}L. Game diff ${teamData.gw - teamData.gl > 0 ? '+' : ''}${teamData.gw - teamData.gl}. Tersisa ${remOpp.length} pertandingan.`);
            if (pPlayoff === 100 && pUpper === 100) texts.push(`🏆 Upper Bracket TERKUNCI. Tim ini dipastikan finis Top 2.`);
            else if (pPlayoff === 100) texts.push(`✅ Tiket Playoff AMAN. Tidak mungkin terdepak dari Top 6.`);
            else if (pPlayoff === 0) texts.push(`❌ Secara matematis sudah TERELIMINASI dari persaingan Playoff.`);
            else if (magicNum !== null) texts.push(`🎯 Magic Number: butuh minimal ${magicNum} kemenangan lagi dari ${remOpp.length} laga sisa.`);
            if (rivals.length > 0) texts.push(`⚔️ Bersaing ketat dengan ${rivals.slice(0,3).join(', ')} di zona kritis.`);
            insightCache[cacheKey] = { ...fallbackData, texts: texts.slice(0, 4) };
        }
        currentAiInsight = insightCache[cacheKey];
        isAiLoading = false;
    }

</script>

<svelte:head>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
</svelte:head>

<style>
    :global(body) {
        font-family: 'Inter', sans-serif;
        background-color: #0b0f1a;
        color: #f1f5f9;
    }

    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
    ::-webkit-scrollbar-thumb:hover { background: #475569; }

    .liqui-table { border-collapse: collapse; width: 100%; font-size: 13px; }
    .liqui-table th { background-color: #1a1a1a; color: #ffffff; font-weight: bold; padding: 6px 8px; border-bottom: 1px solid #333; }
    .liqui-header-dotted { border-bottom: 1px dotted #aaa; cursor: help; }
    .liqui-row-even { background-color: #161616; }
    .liqui-row-odd { background-color: #111111; }
    
    .rank-playoff { background-color: #1e4a2e; color: white; border-right: 1px solid #333; }
    .rank-eliminated { background-color: #5c1c1c; color: white; border-right: 1px solid #333; }
    
    .team-link { color: #66b2ff; text-decoration: none; font-weight: 500; transition: all 0.2s; cursor: pointer; }
    .team-link:hover { text-decoration: underline; color: #99ccff; }

    .bg-prob-cell { position: relative; z-index: 1; }
    .prob-bar { position: absolute; top: 0; bottom: 0; left: 0; z-index: -1; opacity: 0.2; transition: width 0.3s ease; }

    .toast-container { transition: visibility 0s, opacity 0.3s ease-in-out, transform 0.3s ease-in-out; transform: translate(-50%, -20px); visibility: hidden; opacity: 0; }
    .toast-show { visibility: visible; opacity: 1; transform: translate(-50%, 0); }

    .solid-sticky-header { background-color: #0d121c; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3); }
</style>

<main class="min-h-screen pb-12 relative">

    <div class="fixed top-5 left-1/2 {isToastError ? 'bg-red-600' : 'bg-emerald-600'} text-white px-6 py-3 rounded-full shadow-2xl font-bold z-50 flex items-center gap-2 toast-container {showToast ? 'toast-show' : ''}">
        {#if isToastError}
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
        {#else}
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
        {/if}
        <span>{toastMsg}</span>
    </div>

    <div class="max-w-[1400px] mx-auto px-4 pt-8">
        
        <!-- GLOBAL HEADER -->
        <header class="mb-8 flex flex-col md:flex-row justify-between items-center gap-6">
            <div class="text-center md:text-left">
                <h1 class="text-4xl font-black text-white tracking-tighter uppercase italic">
                    MPL ID S17 <span class="text-blue-500">PREDICTOR</span>
                </h1>
                <p class="text-slate-400 font-medium mt-1">Klasemen & AI Simulasi</p>
            </div>
            <div class="flex flex-wrap items-center justify-center gap-3 bg-slate-800/50 p-2 rounded-2xl border border-slate-700">
                <div class="px-4 py-2 border-r border-slate-700 flex flex-col justify-center">
                    <span class="block text-[10px] text-slate-500 font-bold uppercase tracking-widest">Cloud Sync</span>
                    <span class="font-bold text-sm {syncColor}">{syncStatus}</span>
                </div>
                
                <button on:click={shareStandings} class="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl font-bold text-sm transition-all active:scale-95 shadow-lg shadow-blue-900/20 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
                    Share
                </button>

                <!-- SLOT SKENARIO -->
                <div class="relative group z-50">
                    <button class="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl font-bold text-sm transition-all shadow-lg shadow-indigo-900/20 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
                        Skenario ▾
                    </button>
                    <div class="absolute right-0 mt-2 w-[220px] bg-slate-800 border border-slate-600 rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all overflow-hidden">
                        
                        <div class="p-2.5 text-[10px] text-slate-400 font-bold uppercase tracking-widest border-b border-slate-700 bg-slate-900/80 text-center">Simpan Skenario</div>
                        <div class="p-3 flex flex-wrap justify-center gap-2 border-b border-slate-700 bg-slate-800">
                            {#each [1,2,3,4,5,6,7,8,9] as slot}
                                <button on:click={() => saveLocalScenario(slot)} class="w-8 h-8 rounded-lg bg-slate-700 hover:bg-emerald-500 hover:text-white text-slate-300 font-black text-xs transition-all shadow-sm">{slot}</button>
                            {/each}
                        </div>
                        
                        <div class="p-2.5 text-[10px] text-slate-400 font-bold uppercase tracking-widest border-b border-slate-700 bg-slate-900/80 text-center">Muat Skenario</div>
                        <div class="p-3 flex flex-wrap justify-center gap-2 bg-slate-800">
                            {#each [1,2,3,4,5,6,7,8,9] as slot}
                                <button on:click={() => loadLocalScenario(slot)} class="w-8 h-8 rounded-lg bg-slate-700 hover:bg-blue-500 hover:text-white text-slate-300 font-black text-xs transition-all shadow-sm">{slot}</button>
                            {/each}
                        </div>

                    </div>
                </div>

                <button on:click={randomizeRemaining} class="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-xl font-bold text-sm transition-all active:scale-95 shadow-lg shadow-purple-900/20 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                    Auto-Fill
                </button>
                <button on:click={resetSim} class="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-xl font-bold text-sm transition-all active:scale-95 shadow-lg shadow-red-900/20">
                    Reset
                </button>
            </div>
        </header>

        <!-- LAYOUT SIMETRIS UTAMA (Tinggi Dikunci) -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:h-[560px]">
            
            <!-- PANEL KIRI: TABLE KLASEMEN -->
            <div class="lg:col-span-7 border border-[#333] rounded-3xl bg-[#111] shadow-2xl flex flex-col h-full overflow-hidden">
                
                <!-- Header Tabel Klasemen -->
                <div class="px-5 py-4 border-b border-[#333] bg-[#0c0c0c] shrink-0 flex items-center justify-between">
                    <h2 class="text-xl font-black text-white tracking-wide uppercase flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-blue-500"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
                        Regular Season
                    </h2>
                    {#if isCalculating}
                        <span class="text-[10px] bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full font-bold animate-pulse">CALCULATING...</span>
                    {/if}
                </div>

                <!-- Isi Tabel -->
                <div class="flex-1 flex flex-col justify-between overflow-x-auto overflow-y-hidden bg-[#111]">
                    <div class="w-full">
                        <div class="p-2 px-3 flex items-center justify-end border-b border-[#333] bg-[#151515]">
                            <div class="text-[10px] text-gray-400 flex gap-2 font-bold">
                                <span class="text-amber-500">[U] Upper</span>
                                <span class="text-emerald-500">[P] Playoff</span>
                                <span class="text-red-500">[E] Elim</span>
                            </div>
                        </div>
                        <table class="liqui-table text-left whitespace-nowrap w-full">
                            <thead>
                                <tr>
                                    <th class="w-8 text-center cursor-pointer hover:bg-[#333] select-none transition-colors" on:click={() => handleSort('default')}>
                                        # <span class="text-[10px] inline-block w-2 text-blue-400">{sortCol==='default' ? (sortAsc?'▲':'▼') : ''}</span>
                                    </th>
                                    <th>Team <span class="text-[9px] font-normal text-gray-400 ml-1">(Klik u/ Fokus)</span></th>
                                    <th class="text-center w-12"><span class="liqui-header-dotted" title="Matches Won - Matches Lost">M</span></th>
                                    <th class="text-center w-12"><span class="liqui-header-dotted" title="Games Won - Games Lost">G</span></th>
                                    <th class="text-center w-12"><span class="liqui-header-dotted" title="Game Difference">Diff</span></th>
                                    <th class="text-center w-24">Form</th>
                                    <th class="text-center text-[11px] font-normal text-emerald-400 w-14 cursor-pointer hover:bg-[#333] select-none" on:click={() => handleSort('playoff')}>Playoff <span class="text-[10px] inline-block w-2">{sortCol==='playoff' ? (sortAsc?'▲':'▼') : ''}</span></th>
                                    <th class="text-center text-[11px] font-normal text-amber-500 w-14 cursor-pointer hover:bg-[#333] select-none" on:click={() => handleSort('upper')}>Upper <span class="text-[10px] inline-block w-2">{sortCol==='upper' ? (sortAsc?'▲':'▼') : ''}</span></th>
                                    <th class="text-center text-[11px] font-normal text-blue-400 w-14 cursor-pointer hover:bg-[#333] select-none" on:click={() => handleSort('playin')}>Play In <span class="text-[10px] inline-block w-2">{sortCol==='playin' ? (sortAsc?'▲':'▼') : ''}</span></th>
                                    <th class="text-center text-[11px] font-normal text-red-500 w-14 cursor-pointer hover:bg-[#333] select-none" on:click={() => handleSort('elim')}>Elim <span class="text-[10px] inline-block w-2">{sortCol==='elim' ? (sortAsc?'▲':'▼') : ''}</span></th>
                                </tr>
                            </thead>
                            <tbody>
                                {#each sortedList as t, i}
                                    {@const isElim = t.trueRank > 6}
                                    {@const isHighlighted = highlightedTeam === t.n}
                                    {@const highlightOp = (highlightedTeam && !isHighlighted) ? 'opacity-40 grayscale hover:grayscale-0 hover:opacity-100' : ''}
                                    {@const gd = t.gw - t.gl}
                                    {@const pUpper = parseFloat(probs[t.n]?.upper || 0)}
                                    {@const pPlayoff = parseFloat(probs[t.n]?.playoff || 0)}
                                    {@const pPlayin = parseFloat(probs[t.n]?.playin || 0)}
                                    {@const pElim = parseFloat(probs[t.n]?.elim || 0)}
                                    
                                    <tr class="{i % 2 === 0 ? 'liqui-row-even' : 'liqui-row-odd'} border-b border-[#333] transition-colors {highlightOp} {isHighlighted ? 'ring-2 ring-blue-500 ring-inset bg-blue-900/20' : 'hover:bg-[#2a2a2a]'}">
                                        <td class="{isElim ? 'rank-eliminated' : 'rank-playoff'} text-center font-bold text-[14px] py-1.5">{t.trueRank}.</td>
                                        <td class="py-1.5 px-2 flex items-center gap-2 min-w-[130px]">
                                            {#if teamLogos[t.n]}
                                                <img src={teamLogos[t.n]} class="w-6 h-6 object-contain drop-shadow-md shrink-0" alt="logo">
                                            {#else}
                                                <div class="w-6 h-6 rounded flex items-center justify-center text-[10px] font-black {LOGO_COLORS[t.n] || 'bg-gray-500'} shadow-sm shrink-0">{t.n.substring(0,2).toUpperCase()}</div>
                                            {/if}
                                            <div class="flex items-center">
                                                <!-- svelte-ignore a11y-click-events-have-key-events -->
                                                <span on:click={() => toggleHighlight(t.n)} class="team-link {isHighlighted ? 'text-yellow-400 font-black' : ''}">{t.n}</span>
                                                {#if pUpper === 100} <span class="text-[10px] text-amber-500 font-black ml-1 bg-amber-500/20 px-1 rounded">[U]</span>
                                                {:else if pPlayoff === 100} <span class="text-[10px] text-emerald-500 font-black ml-1 bg-emerald-500/20 px-1 rounded">[P]</span>
                                                {:else if pPlayoff === 0} <span class="text-[10px] text-red-500 font-black ml-1 bg-red-500/20 px-1 rounded">[E]</span>{/if}
                                            </div>
                                        </td>
                                        <td class="py-1.5 px-2 text-center font-bold text-white text-[13px]">{t.mw} - {t.ml}</td>
                                        <td class="py-1.5 px-2 text-center text-gray-300 text-[13px]">{t.gw} - {t.gl}</td>
                                        <td class="py-1.5 px-2 text-center font-bold text-[13px] {gd>0?'text-white':(gd<0?'text-red-400':'text-gray-400')}">{gd > 0 ? '+'+gd : gd}</td>
                                        <td class="py-1.5 px-1 text-center whitespace-nowrap">
                                            <div class="flex gap-1 justify-center items-center min-w-[105px]">
                                                {#each Array(5 - t.form.length) as _}
                                                    <div class="w-[18px] h-[18px] rounded-full bg-slate-700/50 flex items-center justify-center text-[9px] text-slate-500 border border-slate-600/50 shrink-0">-</div>
                                                {/each}
                                                {#each t.form as fMatch}
                                                    {@const isW = fMatch.res === 'W'}
                                                    {@const rColor = isW ? 'ring-1 ring-emerald-500 border border-emerald-900' : 'ring-1 ring-red-500 border border-red-900'}
                                                    {#if teamLogos[fMatch.opp]}
                                                        <img src={teamLogos[fMatch.opp]} class="w-[18px] h-[18px] rounded-full object-contain bg-slate-800 {rColor} shrink-0" title="{fMatch.res} vs {fMatch.opp}" alt="">
                                                    {#else}
                                                        <div class="w-[18px] h-[18px] rounded-full bg-slate-800 flex items-center justify-center text-[8px] font-black text-white {rColor} shrink-0" title="{fMatch.res} vs {fMatch.opp}">{fMatch.opp.substring(0,2).toUpperCase()}</div>
                                                    {/if}
                                                {/each}
                                            </div>
                                        </td>
                                        <td class="py-1.5 px-1.5 text-center text-[12px] font-semibold text-emerald-400 border-l border-[#333] bg-prob-cell"><div class="prob-bar bg-emerald-500" style="width: {pPlayoff}%;"></div>{pPlayoff}%</td>
                                        <td class="py-1.5 px-1.5 text-center text-[12px] font-semibold text-amber-500 bg-prob-cell"><div class="prob-bar bg-amber-500" style="width: {pUpper}%;"></div>{pUpper}%</td>
                                        <td class="py-1.5 px-1.5 text-center text-[12px] font-semibold text-blue-400 bg-prob-cell"><div class="prob-bar bg-blue-500" style="width: {pPlayin}%;"></div>{pPlayin}%</td>
                                        <td class="py-1.5 px-1.5 text-center text-[12px] font-semibold text-red-500 bg-prob-cell"><div class="prob-bar bg-red-500" style="width: {pElim}%;"></div>{pElim}%</td>
                                    </tr>

                                    <!-- Zona Eliminasi Line -->
                                    {#if t.trueRank === 6 && sortCol === 'default' && sortAsc === true}
                                        <tr class="bg-red-950/30 border-y border-red-500/30">
                                            <td colspan="10" class="py-1.5 text-center text-[10px] text-red-400/80 font-black tracking-[0.2em] uppercase">↓ Zona Eliminasi ↓</td>
                                        </tr>
                                    {/if}
                                {/each}
                            </tbody>
                        </table>
                    </div>
                    <div class="bg-[#151515] p-2 px-3 text-[10px] text-gray-500 italic border-t border-[#333] mt-auto">
                        <span>Tiebreakers: 1.Matches Win | 2. Net Game Win | 3. Head to Head</span>
                    </div>
                </div>
            </div>

            <!-- PANEL KANAN: JADWAL PREDIKSI -->
            <div class="lg:col-span-5 bg-slate-800/60 backdrop-blur-md rounded-3xl border border-slate-700 shadow-2xl flex flex-col h-full overflow-hidden">
                
                <!-- HEADER NAVIGASI -->
                <div class="px-5 py-4 border-b border-slate-700 bg-[#121826] shrink-0 flex items-center justify-between gap-4 h-[60px]">
                    <div class="flex gap-2 overflow-x-auto scrollbar-hide flex-1 scroll-smooth">
                        {#if highlightedTeam}
                            <div class="bg-blue-900/40 text-blue-300 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 border border-blue-500/50 w-full truncate">
                                Fokus: {TEAM_ABBR[highlightedTeam] || highlightedTeam}
                            </div>
                        {#else}
                            {#each [4,5,6,7,8,9] as w}
                                <button on:click={() => changeWeek(w)} class="px-4 py-1.5 rounded-xl border text-xs font-black transition-all shrink-0 {w === curWeek ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40 border-blue-500' : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'}">W{w}</button>
                            {/each}
                        {/if}
                    </div>
                    <div class="flex gap-2 items-center shrink-0">
                        {#if highlightedTeam}
                            <button on:click={() => toggleHighlight(null)} class="text-xs bg-red-600/20 text-red-400 hover:bg-red-600/40 px-3 py-1.5 rounded-lg font-bold border border-red-500/30 transition-all">Tutup Fokus (X)</button>
                        {:else}
                            <button on:click={randomizeCurrentWeek} class="text-[11px] text-purple-400 hover:text-purple-300 font-bold transition-colors flex items-center gap-1 bg-purple-900/20 px-2 py-1.5 rounded">Auto W{curWeek}</button>
                            <button on:click={clearCurrentWeek} class="text-[11px] text-red-400 hover:text-red-300 font-bold transition-colors bg-red-900/20 px-2 py-1.5 rounded">Clear</button>
                        {/if}
                    </div>
                </div>

                <!-- AREA SCROLL MATCHES -->
                <div bind:this={matchScrollArea} class="flex-1 overflow-y-auto relative scroll-smooth bg-[#0b0f1a]/30">
                    
                    <!-- FOCUS DASHBOARD -->
                    {#if highlightedTeam}
                        <div class="shrink-0 px-5 pt-5 pb-1">
                            <div class="grid grid-cols-3 gap-3">
                                <div class="bg-[#121826] border border-slate-700 p-3 rounded-2xl text-center shadow-lg">
                                    <span class="block text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Win Rate</span>
                                    <span class="block text-xl font-black text-white">{winRate}%</span>
                                </div>
                                <div class="bg-[#121826] border border-slate-700 p-3 rounded-2xl text-center shadow-lg">
                                    <span class="block text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Sisa Laga</span>
                                    <span class="block text-xl font-black text-blue-400">{remOpponents.length}</span>
                                </div>
                                <div class="bg-[#121826] border border-slate-700 p-3 rounded-2xl text-center shadow-lg">
                                    <span class="block text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Diff Lawan</span>
                                    <span class="block text-sm font-black {sosStats.color} mt-1.5">{sosStats.label}</span>
                                </div>
                            </div>
                        </div>
                    {/if}

                    <!-- STICKY MATCH HEADER -->
                    <div class="sticky top-0 z-30 solid-sticky-header">
                        <div class="px-5 py-3 border-b border-slate-700">
                            {#if highlightedTeam}
                                <div class="flex justify-between items-center">
                                    <h3 class="text-sm font-bold text-slate-300 uppercase tracking-widest">Jadwal Tim</h3>
                                    <div class="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-700 shadow-inner">
                                        <button on:click={() => setFocusFilter('all')} class="px-3 py-1 rounded-md text-[10px] uppercase tracking-wider font-bold transition-all {focusFilter === 'all' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'}">Semua</button>
                                        <button on:click={() => setFocusFilter('win')} class="px-3 py-1 rounded-md text-[10px] uppercase tracking-wider font-bold transition-all flex items-center gap-1 {focusFilter === 'win' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-emerald-400'}"><span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>Win</button>
                                        <button on:click={() => setFocusFilter('lose')} class="px-3 py-1 rounded-md text-[10px] uppercase tracking-wider font-bold transition-all flex items-center gap-1 {focusFilter === 'lose' ? 'bg-red-600 text-white shadow' : 'text-slate-400 hover:text-red-400'}"><span class="w-1.5 h-1.5 rounded-full bg-red-400"></span>Lose</button>
                                    </div>
                                </div>
                            {:else}
                                <h3 class="text-sm font-bold text-slate-400 uppercase tracking-widest">Jadwal Minggu {curWeek}</h3>
                            {/if}
                        </div>
                    </div>

                    <!-- MATCH LIST -->
                    <div class="p-5 flex flex-col">
                        {#if highlightedTeam}
                            {@const histM = displayMatches.filter(m => m.fixed)}
                            {@const upM = displayMatches.filter(m => !m.fixed)}

                            {#if histM.length > 0}
                                <h3 class="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Riwayat Pertandingan</h3>
                                {#each histM as m}
                                    <svelte:self matchCard={true} {m} {highlightedTeam} {teamLogos} />
                                {/each}
                            {/if}

                            {#if upM.length > 0}
                                <h3 id="focus-upcoming-header" class="text-xs font-bold text-yellow-500 uppercase tracking-widest mb-3 mt-4 pt-4 border-t border-slate-700">Sisa Jadwal Pertandingan</h3>
                                {#each upM as m}
                                    <svelte:self matchCard={true} {m} {highlightedTeam} {teamLogos} />
                                {/each}
                            {:else if displayMatches.length === 0}
                                <p class="text-slate-500 italic text-sm text-center mt-10">Tidak ada pertandingan yang sesuai dengan filter.</p>
                            {/if}
                        {:else}
                            {#each displayMatches as m}
                                <svelte:self matchCard={true} {m} {highlightedTeam} {teamLogos} />
                            {/each}
                        {/if}
                    </div>
                </div>
            </div>
        </div>

        <!-- AI INSIGHT CONTAINER (Terpisah di Bawah Panel) -->
        {#if highlightedTeam && currentAiInsight}
            <div class="mt-6 w-full lg:w-7/12 transition-all duration-500">
                <div class="bg-gradient-to-br {currentAiInsight.statusColor} border rounded-2xl shadow-2xl overflow-hidden transition-all duration-500">
                    <div class="px-6 pt-5 pb-4 border-b border-slate-700/50">
                        <div class="flex items-center justify-between flex-wrap gap-3">
                            <div class="flex items-center gap-3">
                                <div class="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-600/80 shadow-lg shadow-blue-900/40">
                                    <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-white"><path d="M9.663 17h4.673M12 3v1m6.364 1.636-.707.707M21 12h-1M4 12H3m3.343-5.657-.707-.707m2.828 9.9a5 5 0 1 1 7.072 0l-.548.547A3.374 3.374 0 0 0 14 18.469V19a2 2 0 1 1-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>
                                </div>
                                <div>
                                    <div class="flex items-center gap-2">
                                        <h3 class="text-white font-black text-base">AI Insight</h3>
                                        <span class="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full font-bold border border-blue-500/30">POWERED BY CLAUDE</span>
                                    </div>
                                    <p class="text-slate-400 text-xs mt-0.5">{currentAiInsight.abbr} · Peringkat {currentAiInsight.rank} · {currentAiInsight.mw}W-{currentAiInsight.ml}L</p>
                                </div>
                            </div>
                            <span class="text-xs font-black px-3 py-1.5 rounded-full bg-slate-800/80 text-slate-300 border border-slate-600/50">{currentAiInsight.statusLabel}</span>
                        </div>
                    </div>
                    
                    <div class="px-6 pt-4 pb-3">
                        <p class="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Probabilitas Hasil</p>
                        <div class="grid grid-cols-2 gap-2">
                            <!-- Bars -->
                            {#each [
                                { label: 'Playoff', val: currentAiInsight.pPlayoff, color: '#10b981', bg: 'rgba(16,185,129,0.15)' },
                                { label: 'Upper B.', val: currentAiInsight.pUpper, color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
                                { label: 'Play-In', val: currentAiInsight.pPlayin, color: '#60a5fa', bg: 'rgba(96,165,250,0.15)' },
                                { label: 'Eliminasi', val: currentAiInsight.pElim, color: '#f87171', bg: 'rgba(248,113,113,0.15)' }
                            ] as b}
                                <div class="rounded-xl p-3 flex flex-col gap-1.5" style="background:{b.bg};border:1px solid {b.color}33">
                                    <div class="flex justify-between items-center">
                                        <span class="text-[10px] font-bold uppercase tracking-wider" style="color:{b.color}">{b.label}</span>
                                        <span class="text-sm font-black text-white">{b.val}%</span>
                                    </div>
                                    <div class="w-full h-1.5 rounded-full bg-slate-700/60">
                                        <div class="h-1.5 rounded-full transition-all duration-700" style="width:{Math.min(b.val,100)}%;background:{b.color}"></div>
                                    </div>
                                </div>
                            {/each}
                        </div>
                    </div>

                    <div class="px-6 pb-4 grid grid-cols-3 gap-2">
                        <div class="bg-slate-800/60 rounded-xl p-3 text-center border border-slate-700/50">
                            <p class="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Sisa Laga</p>
                            <p class="text-xl font-black text-white">{currentAiInsight.remOppLength}</p>
                        </div>
                        <div class="bg-slate-800/60 rounded-xl p-3 text-center border border-slate-700/50">
                            <p class="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Magic #</p>
                            <p class="text-xl font-black {currentAiInsight.magicNum === null ? (currentAiInsight.pPlayoff===100?'text-emerald-400':'text-red-400') : 'text-yellow-400'}">
                                {currentAiInsight.magicNum === null ? (currentAiInsight.pPlayoff===100?'✓':'—') : currentAiInsight.magicNum+'W'}
                            </p>
                        </div>
                        <div class="bg-slate-800/60 rounded-xl p-3 text-center border border-slate-700/50">
                            <p class="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Form</p>
                            <p class="text-base font-black tracking-widest">
                                {#if currentAiInsight.form5}
                                    {#each currentAiInsight.form5.split('') as char}
                                        <span class="{char === 'W' ? 'text-emerald-400' : 'text-red-400'}">{char}</span>
                                    {/each}
                                {#else}
                                    <span class="text-slate-500">-</span>
                                {/if}
                            </p>
                        </div>
                    </div>

                    {#if currentAiInsight.remOppLength > 0}
                        <div class="px-6 pb-4">
                            <p class="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Simulasi Skenario</p>
                            <div class="flex gap-2">
                                <button on:click={() => applyBestCase(highlightedTeam)} class="flex-1 text-xs font-bold py-2 px-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 border border-emerald-600/30 transition-all active:scale-95 flex items-center justify-center gap-1.5">
                                    Skenario Terbaik
                                </button>
                                <button on:click={() => applyWorstCase(highlightedTeam)} class="flex-1 text-xs font-bold py-2 px-3 rounded-xl bg-red-600/20 hover:bg-red-600/40 text-red-400 border border-red-600/30 transition-all active:scale-95 flex items-center justify-center gap-1.5">
                                    Skenario Terburuk
                                </button>
                            </div>
                        </div>
                    {/if}

                    <div class="px-6 pb-5 border-t border-slate-700/40 pt-4">
                        <p class="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <span>Analisis AI</span>
                            {#if isAiLoading}<span class="inline-block w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>{/if}
                        </p>
                        {#if isAiLoading}
                            <div class="space-y-2">
                                <div class="h-3 bg-slate-700/60 rounded-full animate-pulse w-full"></div>
                                <div class="h-3 bg-slate-700/60 rounded-full animate-pulse w-4/5"></div>
                                <div class="h-3 bg-slate-700/60 rounded-full animate-pulse w-full mt-3"></div>
                                <div class="h-3 bg-slate-700/60 rounded-full animate-pulse w-3/5"></div>
                            </div>
                        {:else}
                            <div class="space-y-3">
                                {#each currentAiInsight.texts as text, idx}
                                    <div class="flex gap-2.5 items-start group">
                                        <span class="shrink-0 text-base mt-0.5">{['📊', '⚔️', '🔥', '🎯'][idx] || '💡'}</span>
                                        <p class="text-sm text-slate-300 leading-relaxed">{text}</p>
                                    </div>
                                {/each}
                            </div>
                        {/if}
                    </div>
                </div>
            </div>
        {/if}
    </div>

</main>

<!-- MATCH CARD COMPONENT EMULATION (Rendered directly when matchCard=true) -->
<script context="module">
    export let matchCard = false;
    export let m = null;
    export let highlightedTeam = null;
    export let teamLogos = {};
</script>

{#if matchCard && m}
    <div class="p-3.5 rounded-2xl border {m.borderClass} mb-4 transition-all relative">
        <div class="flex justify-between items-center mb-3">
            <div class="flex items-center">
                <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{highlightedTeam ? `W${m.w} / Match ${m.id}` : `Match ${m.id}`}</span>
                {#if m.isCrucial}
                    <span class="bg-gradient-to-r from-orange-600 to-red-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded ml-2 shadow-[0_0_8px_rgba(239,68,68,0.5)] animate-pulse" title="Laga Penentu Zona Playoff">🔥 KRUSIAL</span>
                {/if}
            </div>
            <div class="flex items-center gap-2">
                {#if m.s1 !== null && !m.fixed}
                    <button on:click={() => clearMatch(m.id)} class="text-[10px] text-slate-400 hover:text-red-400 transition hover:bg-red-500/10 rounded-full p-1" title="Clear Prediksi"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button>
                {/if}
                <span class="text-[9px] font-bold px-2 py-0.5 rounded {m.fixed ? 'bg-slate-800 text-slate-400' : (m.s1 !== null ? 'bg-blue-900/50 text-blue-400' : 'bg-[#1a2333] text-slate-400')}">
                    {m.fixed ? 'FINISHED' : (m.s1 !== null ? 'PREDICTED' : 'UPCOMING')}
                </span>
            </div>
        </div>
        <div class="flex items-center justify-between gap-4">
            <div class="flex-1 flex justify-end items-center gap-3">
                <span class="text-sm font-black {m.t1 === highlightedTeam ? 'text-yellow-400' : (m.t1 === 'RRQ Hoshi' ? 'text-orange-400' : 'text-slate-200')} text-right truncate">{TEAM_ABBR[m.t1] || m.t1}</span>
                {#if teamLogos[m.t1]}<img src={teamLogos[m.t1]} class="w-6 h-6 object-contain drop-shadow-md shrink-0" alt="l">{:else}<div class="w-6 h-6 rounded flex items-center justify-center text-[10px] font-black {LOGO_COLORS[m.t1] || 'bg-gray-500'} shadow-sm shrink-0">{m.t1.substring(0,2).toUpperCase()}</div>{/if}
            </div>
            <div class="flex-none flex flex-col items-center justify-center min-w-[80px]">
                {#if m.focusResult === 'WIN'}
                    <span class="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded text-[10px] font-black tracking-widest mb-1.5 shadow-sm">WIN</span>
                {:else if m.focusResult === 'LOSE'}
                    <span class="bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded text-[10px] font-black tracking-widest mb-1.5 shadow-sm">LOSE</span>
                {/if}

                {#if m.fixed}
                    <div class="bg-slate-900/80 px-4 py-1.5 rounded-xl border border-slate-700 shadow-inner flex items-center gap-3">
                        <span class="{m.s1 > m.s2 ? 'text-white' : 'text-slate-500'} font-black text-sm">{m.s1}</span>
                        <span class="text-slate-600 text-xs font-black">:</span>
                        <span class="{m.s2 > m.s1 ? 'text-white' : 'text-slate-500'} font-black text-sm">{m.s2}</span>
                    </div>
                {:else}
                    <div class="p-1.5 rounded-xl border {m.s1 !== null ? 'border-blue-500/50 shadow-[0_0_10px_rgba(59,130,246,0.15)] bg-[#1a2333]' : 'border-slate-700 bg-slate-900/80 shadow-inner'} flex items-center gap-2 transition-all">
                        <select bind:value={m.s1} on:change={(e) => setDropdownScore(m.id, 1, e.target.value)} class="appearance-none bg-slate-800 text-white text-center font-bold rounded py-1.5 w-8 text-sm border {m.s1 !== null ? 'border-blue-500/50 text-blue-400' : 'border-slate-600'} hover:bg-slate-700 outline-none cursor-pointer" style="text-align-last: center;">
                            <option value={null}>-</option>
                            <option value={0}>0</option>
                            <option value={1}>1</option>
                            <option value={2}>2</option>
                        </select>
                        <span class="text-slate-600 text-[10px] font-black">:</span>
                        <select bind:value={m.s2} on:change={(e) => setDropdownScore(m.id, 2, e.target.value)} class="appearance-none bg-slate-800 text-white text-center font-bold rounded py-1.5 w-8 text-sm border {m.s2 !== null ? 'border-blue-500/50 text-blue-400' : 'border-slate-600'} hover:bg-slate-700 outline-none cursor-pointer" style="text-align-last: center;">
                            <option value={null}>-</option>
                            <option value={0}>0</option>
                            <option value={1}>1</option>
                            <option value={2}>2</option>
                        </select>
                    </div>
                {/if}
                <span class="text-slate-500 text-[9px] font-bold mt-1 tracking-widest" title="Head to Head Musim Ini">H2H: {m.h2hT1}-{m.h2hT2}</span>
            </div>
            <div class="flex-1 flex justify-start items-center gap-3">
                {#if teamLogos[m.t2]}<img src={teamLogos[m.t2]} class="w-6 h-6 object-contain drop-shadow-md shrink-0" alt="l">{:else}<div class="w-6 h-6 rounded flex items-center justify-center text-[10px] font-black {LOGO_COLORS[m.t2] || 'bg-gray-500'} shadow-sm shrink-0">{m.t2.substring(0,2).toUpperCase()}</div>{/if}
                <span class="text-sm font-black {m.t2 === highlightedTeam ? 'text-yellow-400' : (m.t2 === 'RRQ Hoshi' ? 'text-orange-400' : 'text-slate-200')} text-left truncate">{TEAM_ABBR[m.t2] || m.t2}</span>
            </div>
        </div>
    </div>
{/if}