export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  
  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxt/icon',
    '@nuxtjs/i18n'
  ],

  i18n: {
    locales: [
      { code: 'zh', name: '中文', file: 'zh-CN.json' },
      { code: 'en', name: 'English', file: 'en-US.json' },
      { code: 'ja', name: '日本語', file: 'ja-JP.json' }
    ],
    defaultLocale: 'zh',
    langDir: 'locales',
    strategy: 'no_prefix',
    compilation: {
      strictMessage: false,
      escapeHtml: false
    },
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root'
    }
  },

  runtimeConfig: {
    jwtSecret: process.env.JWT_SECRET || 'tomybot-secret-key-change-in-production',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
    dbHost: process.env.DB_HOST || 'localhost',
    dbPort: parseInt(process.env.DB_PORT || '3306'),
    dbName: process.env.DB_NAME || 'tomybot',
    dbUser: process.env.DB_USER || 'root',
    dbPassword: process.env.DB_PASSWORD || '',
    qwenApiKey: process.env.QWEN_API_KEY || '',
    qwenApiUrl: process.env.QWEN_API_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
    qwenModel: process.env.QWEN_MODEL || 'qwen-plus',
    qwenSystemPrompt: process.env.QWEN_SYSTEM_PROMPT || '你是TomyBot智能助手，一个专业、友好、高效的客服AI。请用简洁、专业的语言回答用户问题。',
    smtpHost: process.env.SMTP_HOST || 'exmail.qq.com',
    smtpPort: parseInt(process.env.SMTP_PORT || '587'),
    smtpUser: process.env.SMTP_USER || 'notice@sayco.com.cn',
    smtpPass: process.env.SMTP_PASS || '',
    contactEmail: process.env.CONTACT_EMAIL || 'info@sayco.com.cn',
    ragDocsPath: process.env.RAG_DOCS_PATH || './docs',
    ragIndexPath: process.env.RAG_INDEX_PATH || './.vectra',
    skillsPath: process.env.SKILLS_PATH || './skills',
    embeddingApiKey: process.env.EMBEDDING_API_KEY || process.env.QWEN_API_KEY || '',
    embeddingApiUrl: process.env.EMBEDDING_API_URL || 'https://dashscope.aliyuncs.com/api/v1/services/embeddings/text-embedding/text-embedding',
    embeddingModel: process.env.EMBEDDING_MODEL || 'text-embedding-v3',
    public: {
      apiBase: process.env.API_BASE || '/api'
    }
  },

  nitro: {
    experimental: {
      tasks: true
    }
  },

  css: ['~/app/assets/css/main.css'],

  app: {
    head: {
      title: 'TomyBot - AI 智能助手',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'TomyBot AI智能助手 - 让客服更智能，让服务更高效' },
        { name: 'theme-color', content: '#4a5568' }
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&family=DM+Sans:wght@400;500;700&family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&family=Noto+Sans+SC:wght@300;400;500;600;700&display=swap' }
      ]
    }
  },

  typescript: {
    strict: true,
    shim: false
  }
})
