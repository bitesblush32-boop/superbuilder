export type QuizQuestion = {
  id:       number
  type:     'mcq' | 'tf' | 'short'
  question: string
  options?: { key: string; label: string }[]
  hint?:    string
}

// Correct answer keys for MCQ/TF questions (questions 1-8)
export const CORRECT_ANSWERS: Record<string, Record<number, string>> = {
  health:        { 1:'b', 2:'b', 3:'a', 4:'b', 5:'b', 6:'b', 7:'a', 8:'b' },
  education:     { 1:'b', 2:'b', 3:'a', 4:'b', 5:'b', 6:'b', 7:'a', 8:'b' },
  finance:       { 1:'b', 2:'b', 3:'a', 4:'b', 5:'b', 6:'b', 7:'a', 8:'b' },
  environment:   { 1:'b', 2:'b', 3:'a', 4:'b', 5:'b', 6:'b', 7:'a', 8:'b' },
  entertainment: { 1:'b', 2:'b', 3:'a', 4:'b', 5:'b', 6:'b', 7:'a', 8:'b' },
  social_impact: { 1:'b', 2:'b', 3:'a', 4:'b', 5:'b', 6:'b', 7:'a', 8:'b' },
}

// Short-answer minimum character thresholds (questions 9 and 10)
export const SHORT_ANSWER_MIN: Record<number, number> = { 9: 10, 10: 30 }

export const QUIZ_QUESTIONS: Record<string, QuizQuestion[]> = {

  health: [
    { id:1, type:'mcq', question:'What is "telemedicine"?', options:[
      {key:'a',label:'Medicine for elderly people only'},
      {key:'b',label:'Delivering healthcare remotely via video or phone'},
      {key:'c',label:'A type of hospital'},
      {key:'d',label:'TV commercials for medicines'},
    ]},
    { id:2, type:'mcq', question:'AI in healthcare mainly helps by:', options:[
      {key:'a',label:'Replacing all doctors completely'},
      {key:'b',label:'Assisting diagnosis and detecting patterns in medical data'},
      {key:'c',label:'Manufacturing medicines faster'},
      {key:'d',label:'Building hospitals automatically'},
    ]},
    { id:3, type:'tf', question:'True or False: AI can analyze X-rays and scans to help detect diseases like cancer.', options:[
      {key:'a',label:'✅ True'},
      {key:'b',label:'❌ False'},
    ]},
    { id:4, type:'mcq', question:'What does a "symptom checker" app do?', options:[
      {key:'a',label:'Books doctor appointments'},
      {key:'b',label:'Lets you describe symptoms and AI identifies likely conditions'},
      {key:'c',label:'Sells medicines online'},
      {key:'d',label:'Tracks hospital bed availability'},
    ]},
    { id:5, type:'mcq', question:'The biggest barrier to healthcare in rural India is:', options:[
      {key:'a',label:'Too many hospitals'},
      {key:'b',label:'Lack of doctors, distance, and high costs'},
      {key:'c',label:'Too much medicine available'},
      {key:'d',label:'Too many patients in cities'},
    ]},
    { id:6, type:'mcq', question:'Wearable health tech (like a smartwatch) helps track:', options:[
      {key:'a',label:'Only the time'},
      {key:'b',label:'Health metrics like heart rate, sleep quality, and daily steps'},
      {key:'c',label:'Only phone calls'},
      {key:'d',label:'School attendance'},
    ]},
    { id:7, type:'tf', question:'True or False: Patient health data must be kept private and secure.', options:[
      {key:'a',label:'✅ True'},
      {key:'b',label:'❌ False'},
    ]},
    { id:8, type:'mcq', question:'"Preventive healthcare" means:', options:[
      {key:'a',label:'Treating illness after it occurs'},
      {key:'b',label:'Preventing illness before it starts through monitoring and early detection'},
      {key:'c',label:'Preventing people from seeing doctors'},
      {key:'d',label:'Using only expensive medicines'},
    ]},
    { id:9,  type:'short', question:'Name one way AI could help a patient in a remote Indian village access medical advice.', hint:'Think about chatbots, WhatsApp bots, diagnostic tools, or telemedicine apps...' },
    { id:10, type:'short', question:'Describe one health problem you would solve with AI in India, and explain how it would work.', hint:'Be specific — who has this problem, how does AI solve it, who benefits?' },
  ],

  education: [
    { id:1, type:'mcq', question:'What is "adaptive learning"?', options:[
      {key:'a',label:'Learning to swim'},
      {key:'b',label:'AI that adjusts lesson difficulty based on each student\'s performance'},
      {key:'c',label:'Learning to adapt to weather changes'},
      {key:'d',label:'Outdoor education programmes'},
    ]},
    { id:2, type:'mcq', question:'A chatbot tutor can help students by:', options:[
      {key:'a',label:'Doing their homework for them'},
      {key:'b',label:'Answering questions and explaining concepts anytime, day or night'},
      {key:'c',label:'Replacing teachers at school'},
      {key:'d',label:'Only conducting exams'},
    ]},
    { id:3, type:'tf', question:'True or False: AI can detect when a student is struggling and suggest easier content.', options:[
      {key:'a',label:'✅ True'},
      {key:'b',label:'❌ False'},
    ]},
    { id:4, type:'mcq', question:'A major education challenge in India\'s schools is:', options:[
      {key:'a',label:'Too many schools'},
      {key:'b',label:'Language diversity, learning gaps, and lack of personalisation'},
      {key:'c',label:'Too many teachers'},
      {key:'d',label:'Too much funding'},
    ]},
    { id:5, type:'mcq', question:'"Gamification" in education means:', options:[
      {key:'a',label:'Playing video games instead of studying'},
      {key:'b',label:'Using points, badges, and levels to make learning more engaging'},
      {key:'c',label:'Watching cartoons in class'},
      {key:'d',label:'Only sports education'},
    ]},
    { id:6, type:'mcq', question:'AI language tools can help Indian students by:', options:[
      {key:'a',label:'Teaching only in English'},
      {key:'b',label:'Making educational content available in regional languages like Hindi, Tamil, and Telugu'},
      {key:'c',label:'Only translating books'},
      {key:'d',label:'Only working in cities'},
    ]},
    { id:7, type:'tf', question:'True or False: AI can help identify students at risk of dropping out of school.', options:[
      {key:'a',label:'✅ True'},
      {key:'b',label:'❌ False'},
    ]},
    { id:8, type:'mcq', question:'Which of these is an AI-powered education tool?', options:[
      {key:'a',label:'A blackboard'},
      {key:'b',label:'Duolingo — an AI language learning app'},
      {key:'c',label:'A pencil'},
      {key:'d',label:'A library card'},
    ]},
    { id:9,  type:'short', question:'Name one real problem students in India face that AI could solve.', hint:'Think about language barriers, homework help, exam anxiety, access to quality teachers...' },
    { id:10, type:'short', question:'Describe an AI education tool you would build and explain who it would help.', hint:'Be specific — which students, what problem, how does AI help?' },
  ],

  finance: [
    { id:1, type:'mcq', question:'AI in finance is mainly used for:', options:[
      {key:'a',label:'Printing money'},
      {key:'b',label:'Fraud detection, credit scoring, and investment advice'},
      {key:'c',label:'Building ATMs'},
      {key:'d',label:'Designing wallets'},
    ]},
    { id:2, type:'mcq', question:'A "credit score" tells a bank:', options:[
      {key:'a',label:'How tall you are'},
      {key:'b',label:'How likely you are to repay a loan based on your financial history'},
      {key:'c',label:'How much money you have today'},
      {key:'d',label:'Your favourite colour'},
    ]},
    { id:3, type:'tf', question:'True or False: AI can detect unusual transactions and flag them as potential fraud.', options:[
      {key:'a',label:'✅ True'},
      {key:'b',label:'❌ False'},
    ]},
    { id:4, type:'mcq', question:'"Financial inclusion" means:', options:[
      {key:'a',label:'Including finance as a school subject'},
      {key:'b',label:'Giving people without bank accounts access to financial services'},
      {key:'c',label:'Including all currencies in a wallet'},
      {key:'d',label:'Making banks bigger'},
    ]},
    { id:5, type:'mcq', question:'A "robo-advisor" is:', options:[
      {key:'a',label:'A robot that handles physical cash'},
      {key:'b',label:'An AI system that provides personalised investment recommendations'},
      {key:'c',label:'A banking ATM machine'},
      {key:'d',label:'A credit card company'},
    ]},
    { id:6, type:'mcq', question:'UPI in India is an example of:', options:[
      {key:'a',label:'AI replacing all banks'},
      {key:'b',label:'Digital payment technology making transactions fast and affordable'},
      {key:'c',label:'A new currency replacing rupees'},
      {key:'d',label:'A credit card system'},
    ]},
    { id:7, type:'tf', question:'True or False: Many people in rural India still don\'t have access to a bank account.', options:[
      {key:'a',label:'✅ True'},
      {key:'b',label:'❌ False'},
    ]},
    { id:8, type:'mcq', question:'"Micro-lending" helps:', options:[
      {key:'a',label:'Large corporations only'},
      {key:'b',label:'Small borrowers like farmers and street vendors who can\'t access traditional bank loans'},
      {key:'c',label:'Only wealthy people'},
      {key:'d',label:'Stock market investors'},
    ]},
    { id:9,  type:'short', question:'Name one money-related problem that people in India face that AI could solve.', hint:'Think about budgeting, savings, loan access, financial scams, understanding taxes...' },
    { id:10, type:'short', question:'Describe an AI finance tool you\'d build for people who don\'t have bank accounts.', hint:'Be specific — how would they access it, what would it do, why is it useful?' },
  ],

  environment: [
    { id:1, type:'mcq', question:'AI is used in environmental monitoring primarily to:', options:[
      {key:'a',label:'Build more factories'},
      {key:'b',label:'Analyze satellite and sensor data to track pollution, forests, and climate'},
      {key:'c',label:'Stop people from driving'},
      {key:'d',label:'Design parks'},
    ]},
    { id:2, type:'mcq', question:'"Climate change" refers to:', options:[
      {key:'a',label:'Daily weather changes'},
      {key:'b',label:'Long-term shifts in global temperatures and weather patterns due to human activity'},
      {key:'c',label:'Only seasonal changes'},
      {key:'d',label:'Changes in fashion trends'},
    ]},
    { id:3, type:'tf', question:'True or False: AI can help predict natural disasters like floods and droughts before they happen.', options:[
      {key:'a',label:'✅ True'},
      {key:'b',label:'❌ False'},
    ]},
    { id:4, type:'mcq', question:'"Precision agriculture" uses AI to:', options:[
      {key:'a',label:'Make farming more expensive'},
      {key:'b',label:'Optimise water, fertilizer, and pesticide use to improve crop yield'},
      {key:'c',label:'Replace all farmers with robots'},
      {key:'d',label:'Only grow rice'},
    ]},
    { id:5, type:'mcq', question:'The biggest air quality problem in Indian cities comes from:', options:[
      {key:'a',label:'Too many trees'},
      {key:'b',label:'Vehicle emissions, industrial pollution, and crop stubble burning'},
      {key:'c',label:'Too much rain'},
      {key:'d',label:'Cool weather'},
    ]},
    { id:6, type:'mcq', question:'"Carbon footprint" refers to:', options:[
      {key:'a',label:'Footprints left on a beach'},
      {key:'b',label:'The total greenhouse gases released by a person, product, or activity'},
      {key:'c',label:'A type of shoe'},
      {key:'d',label:'Forest area measured in acres'},
    ]},
    { id:7, type:'tf', question:'True or False: Renewable energy sources like solar and wind produce no greenhouse gases while operating.', options:[
      {key:'a',label:'✅ True'},
      {key:'b',label:'❌ False'},
    ]},
    { id:8, type:'mcq', question:'AI-powered waste sorting helps by:', options:[
      {key:'a',label:'Producing more waste'},
      {key:'b',label:'Automatically identifying recyclable materials to reduce landfill waste'},
      {key:'c',label:'Sorting only metals'},
      {key:'d',label:'Burning waste faster'},
    ]},
    { id:9,  type:'short', question:'Name one environmental problem in India that AI could help solve.', hint:'Think about water scarcity, air pollution, crop disease, deforestation, waste management...' },
    { id:10, type:'short', question:'Describe an AI solution you\'d build to help farmers or rural communities deal with an environmental challenge.', hint:'Who uses it? What data does it need? What problem does it solve?' },
  ],

  entertainment: [
    { id:1, type:'mcq', question:'AI recommendation systems (like Netflix or Spotify) work by:', options:[
      {key:'a',label:'Random selection'},
      {key:'b',label:'Analyzing your past behaviour to predict what you\'ll enjoy next'},
      {key:'c',label:'Showing only the most expensive content'},
      {key:'d',label:'Only showing new releases'},
    ]},
    { id:2, type:'mcq', question:'"Generative AI" for content creation can:', options:[
      {key:'a',label:'Only edit existing images'},
      {key:'b',label:'Create original images, music, videos, and text from a description'},
      {key:'c',label:'Only make company logos'},
      {key:'d',label:'Replace the entire internet'},
    ]},
    { id:3, type:'tf', question:'True or False: AI can compose original music in different styles (classical, pop, jazz).', options:[
      {key:'a',label:'✅ True'},
      {key:'b',label:'❌ False'},
    ]},
    { id:4, type:'mcq', question:'"Content moderation" using AI helps platforms:', options:[
      {key:'a',label:'Create more viral content'},
      {key:'b',label:'Automatically identify and remove harmful or inappropriate content'},
      {key:'c',label:'Only translate content to other languages'},
      {key:'d',label:'Count the number of views'},
    ]},
    { id:5, type:'mcq', question:'AI in gaming is used for:', options:[
      {key:'a',label:'Only improving graphics'},
      {key:'b',label:'Creating intelligent game characters, adaptive difficulty, and generated game worlds'},
      {key:'c',label:'Making better game controllers'},
      {key:'d',label:'Only online multiplayer games'},
    ]},
    { id:6, type:'mcq', question:'"Deepfake" technology is concerning because:', options:[
      {key:'a',label:'It makes videos load slowly'},
      {key:'b',label:'It can create realistic fake videos of people saying or doing things they never did'},
      {key:'c',label:'It only affects celebrities'},
      {key:'d',label:'It slows down the internet'},
    ]},
    { id:7, type:'tf', question:'True or False: AI can personalise a user\'s entertainment experience based on their mood or time of day.', options:[
      {key:'a',label:'✅ True'},
      {key:'b',label:'❌ False'},
    ]},
    { id:8, type:'mcq', question:'Which Indian platform uses AI to personalise content recommendations?', options:[
      {key:'a',label:'Radio stations'},
      {key:'b',label:'Hotstar/JioCinema — using viewing history to suggest shows'},
      {key:'c',label:'Newspaper apps'},
      {key:'d',label:'Only cinema theatres'},
    ]},
    { id:9,  type:'short', question:'Name one way AI could make entertainment more fun or accessible for people in India.', hint:'Think about language barriers, regional content, affordability, discovery problems...' },
    { id:10, type:'short', question:'Describe an AI entertainment tool you\'d build specifically for Indian teenagers.', hint:'What problem does it solve? How does AI make it better than existing apps?' },
  ],

  social_impact: [
    { id:1, type:'mcq', question:'"Social impact technology" means:', options:[
      {key:'a',label:'Social media apps for influencers'},
      {key:'b',label:'Technology designed to address social problems and improve lives of underserved communities'},
      {key:'c',label:'Only large company software'},
      {key:'d',label:'Entertainment applications'},
    ]},
    { id:2, type:'mcq', question:'AI can help people with disabilities by:', options:[
      {key:'a',label:'Ignoring their needs'},
      {key:'b',label:'Providing speech-to-text, image description, and other assistive tools'},
      {key:'c',label:'Creating more barriers'},
      {key:'d',label:'Only helping with physical disabilities'},
    ]},
    { id:3, type:'tf', question:'True or False: AI can help match volunteers with communities that need assistance.', options:[
      {key:'a',label:'✅ True'},
      {key:'b',label:'❌ False'},
    ]},
    { id:4, type:'mcq', question:'"Digital divide" refers to:', options:[
      {key:'a',label:'The internet splitting into two parts'},
      {key:'b',label:'The gap between people who have technology access and those who don\'t'},
      {key:'c',label:'Different social media platforms competing'},
      {key:'d',label:'Computer viruses spreading'},
    ]},
    { id:5, type:'mcq', question:'AI can improve disaster response by:', options:[
      {key:'a',label:'Causing more disasters'},
      {key:'b',label:'Predicting disasters, coordinating aid, and identifying survivors'},
      {key:'c',label:'Only working in major cities'},
      {key:'d',label:'Replacing all aid workers'},
    ]},
    { id:6, type:'mcq', question:'Women\'s safety apps in India use AI to:', options:[
      {key:'a',label:'Track fashion trends'},
      {key:'b',label:'Send SOS alerts, detect unsafe situations, and connect to emergency services'},
      {key:'c',label:'Only track GPS location'},
      {key:'d',label:'Replace police entirely'},
    ]},
    { id:7, type:'tf', question:'True or False: AI can translate complex legal documents into simple language so ordinary people understand their rights.', options:[
      {key:'a',label:'✅ True'},
      {key:'b',label:'❌ False'},
    ]},
    { id:8, type:'mcq', question:'"E-governance" with AI makes government services:', options:[
      {key:'a',label:'More expensive and complicated'},
      {key:'b',label:'Digitally accessible — like passport, ration card, and tax filing from your phone'},
      {key:'c',label:'Only available in big cities'},
      {key:'d',label:'Completely automated with no human staff'},
    ]},
    { id:9,  type:'short', question:'Name one social problem in India that AI could help solve.', hint:'Think about poverty, caste discrimination, women\'s safety, farmer distress, child labour...' },
    { id:10, type:'short', question:'Describe an AI tool you\'d build to help a specific underserved community in India.', hint:'Who are they? What problem do they face? How does your AI tool change their life?' },
  ],
}

// Domain display meta (for UI use)
export const DOMAIN_META: Record<string, { emoji: string; label: string }> = {
  health:        { emoji: '🏥', label: 'Health' },
  education:     { emoji: '🎓', label: 'Education' },
  finance:       { emoji: '💰', label: 'Finance' },
  environment:   { emoji: '🌱', label: 'Environment' },
  entertainment: { emoji: '🎮', label: 'Entertainment' },
  social_impact: { emoji: '🤝', label: 'Social Impact' },
}
