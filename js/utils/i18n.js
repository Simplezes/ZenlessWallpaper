(function () {
    'use strict';

    const SUPPORTED = ['en', 'es', 'zh', 'ja', 'ko'];

    const UI_STRINGS = {
        en: {
            agentFile: 'Agent File',
            tabProfile: 'Profile', tabCombat: 'Combat', tabWEngine: 'W-Engine',
            viewFullDossier: 'View Full Dossier', hideFullDossier: 'Hide Full Dossier',
            loadingDossier: 'Loading dossier...',
            noProfileData: 'No profile data available.',
            noCombatData: 'No combat data available yet for this agent.',
            noWEngineData: 'No W-Engine data available.',
            realName: 'Real Name', gender: 'Gender', height: 'Height', birthday: 'Birthday',
            species: 'Species', relatives: 'Relatives',
            baseStat: 'Base Stat', advancedStat: 'Advanced Stat'
        },
        es: {
            agentFile: 'Ficha del Agente',
            tabProfile: 'Perfil', tabCombat: 'Combate', tabWEngine: 'Motor-W',
            viewFullDossier: 'Ver Ficha Completa', hideFullDossier: 'Ocultar Ficha',
            loadingDossier: 'Cargando ficha...',
            noProfileData: 'No hay datos de perfil disponibles.',
            noCombatData: 'Aun no hay datos de combate para este agente.',
            noWEngineData: 'No hay datos de Motor-W disponibles.',
            realName: 'Nombre Real', gender: 'Genero', height: 'Estatura', birthday: 'Cumpleanos',
            species: 'Especie', relatives: 'Familiares',
            baseStat: 'Estadistica Base', advancedStat: 'Estadistica Avanzada'
        },
        zh: {
            agentFile: '特工档案',
            tabProfile: '资料', tabCombat: '战斗', tabWEngine: '音擎',
            viewFullDossier: '查看完整档案', hideFullDossier: '收起档案',
            loadingDossier: '档案加载中...',
            noProfileData: '暂无资料数据。',
            noCombatData: '该特工暂无战斗数据。',
            noWEngineData: '暂无音擎数据。',
            realName: '真实姓名', gender: '性别', height: '身高', birthday: '生日',
            species: '种族', relatives: '关系',
            baseStat: '基础属性', advancedStat: '进阶属性'
        },
        ja: {
            agentFile: 'エージェントファイル',
            tabProfile: 'プロフィール', tabCombat: '戦闘', tabWEngine: '音動機',
            viewFullDossier: '詳細を表示', hideFullDossier: '詳細を隠す',
            loadingDossier: 'ファイルを読み込み中...',
            noProfileData: 'プロフィールデータがありません。',
            noCombatData: 'このエージェントの戦闘データはまだありません。',
            noWEngineData: '音動機データがありません。',
            realName: '本名', gender: '性別', height: '身長', birthday: '誕生日',
            species: '種族', relatives: '関係者',
            baseStat: '基礎ステータス', advancedStat: '上級ステータス'
        },
        ko: {
            agentFile: '에이전트 파일',
            tabProfile: '프로필', tabCombat: '전투', tabWEngine: '음동기',
            viewFullDossier: '전체 파일 보기', hideFullDossier: '파일 숨기기',
            loadingDossier: '파일 불러오는 중...',
            noProfileData: '프로필 데이터가 없습니다.',
            noCombatData: '이 에이전트의 전투 데이터가 아직 없습니다.',
            noWEngineData: '음동기 데이터가 없습니다.',
            realName: '실명', gender: '성별', height: '신장', birthday: '생일',
            species: '종족', relatives: '관계자',
            baseStat: '기본 스탯', advancedStat: '상급 스탯'
        }
    };

    const DAY_ABBR = {
        en: ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'],
        es: ['DOM', 'LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB'],
        zh: ['日', '一', '二', '三', '四', '五', '六'],
        ja: ['日', '月', '火', '水', '木', '金', '土'],
        ko: ['일', '월', '화', '수', '목', '금', '토']
    };

    const MONTH_ABBR = {
        en: ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'],
        es: ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'],
        zh: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
        ja: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
        ko: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월']
    };

    const MONTH_KEYS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

    let currentLang = 'en';
    let data = null;

    function loadLangData(lang) {
        if (lang === 'en') {
            data = null;
            return Promise.resolve();
        }
        return fetch(`assets/i18n/${lang}.json`)
            .then(r => r.ok ? r.json() : null)
            .then(d => { data = d; })
            .catch(() => { data = null; });
    }

    window.i18n = {
        get lang() { return currentLang; },
        setLanguage(lang) {
            if (!SUPPORTED.includes(lang)) lang = 'en';
            currentLang = lang;
            return loadLangData(lang).then(() => {
                window.dispatchEvent(new CustomEvent('language-changed', { detail: { lang } }));
            });
        },
        t(key) {
            const table = UI_STRINGS[currentLang] || UI_STRINGS.en;
            return table[key] || UI_STRINGS.en[key] || key;
        },
        charName(englishName) {
            return (data && data.characters && data.characters[englishName] && data.characters[englishName].name) || englishName;
        },
        charNickname(englishName, fallbackNickname) {
            return (data && data.characters && data.characters[englishName] && data.characters[englishName].nickname) || fallbackNickname;
        },
        faction(englishFaction) {
            return (data && data.factions && data.factions[englishFaction]) || englishFaction;
        },
        dossier(englishName) {
            return (data && data.dossier && data.dossier[englishName]) || null;
        },
        dayName(jsDayIndex) {
            return (DAY_ABBR[currentLang] || DAY_ABBR.en)[jsDayIndex];
        },
        monthName(jsMonthIndex) {
            return (MONTH_ABBR[currentLang] || MONTH_ABBR.en)[jsMonthIndex];
        },
        monthNameFromKey(key) {
            const idx = MONTH_KEYS.indexOf(key);
            return idx >= 0 ? this.monthName(idx) : key;
        }
    };

    const initial = window.safeStorage ? window.safeStorage.get('language', 'en') : (localStorage.getItem('language') || 'en');
    window.i18n.setLanguage(initial);
})();
