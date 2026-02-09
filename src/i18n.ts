import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Simple translation resources
const resources = {
    en: {
        translation: {
            "app.title": "TOEIC Neural Academy",
            "study.mode": "Study Mode",
            "analytics": "Analytics",
            "flashcards": "Flashcards",
            "admin": "Admin Dashboard",
            "community": "Community"
        }
    },
    ja: {
        translation: {
            "app.title": "TOEIC Neural Academy",
            "study.mode": "学習モード",
            "analytics": "分析",
            "flashcards": "暗記カード",
            "admin": "管理画面",
            "community": "コミュニティ"
        }
    },
    zh: {
        translation: {
            "app.title": "TOEIC 神经学院",
            "study.mode": "学习模式",
            "analytics": "分析",
            "flashcards": "抽认卡",
            "admin": "管理仪表板",
            "community": "社区"
        }
    },
    ko: {
        translation: {
            "app.title": "TOEIC 뉴럴 아카데미",
            "study.mode": "학습 모드",
            "analytics": "분석",
            "flashcards": "플래시카드",
            "admin": "관리 대시보드",
            "community": "커뮤니티"
        }
    }
};

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: "ja", // Default language
        fallbackLng: "en",
        interpolation: {
            escapeValue: false
        }
    });

export default i18n;
