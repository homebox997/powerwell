/**
 * PawWell Community — Mock Data
 * ============================================================
 * 数据库接口预留：
 *   community_db_port = 3004（posts 表，comments 表）
 *   user_db_port     = 3005（用户资料表）
 * ============================================================
 * 未来接入真实数据库后，只需把这里的 MOCK_DATA 替换为 Supabase fetch 调用
 */

const MOCK_USERS = [
    { id: 'u1', name: 'Sarah M.', nickname: 'MiloMum', avatar: 'SM', color: '#ff6b6b', dogs: [{ name: 'Milo', breed: 'Golden Retriever', age: 11, avatar: '🦡' }] },
    { id: 'u2', name: 'James K.', nickname: 'DukeDad', avatar: 'JK', color: '#4a9eb8', dogs: [{ name: 'Duke', breed: 'German Shepherd', age: 9, avatar: '🦮' }] },
    { id: 'u3', name: 'Linda T.', nickname: 'BellaLover', avatar: 'LT', color: '#c0392b', dogs: [{ name: 'Bella', breed: 'Cavalier King Charles', age: 10, avatar: '🐶' }] },
    { id: 'u4', name: 'Mark R.', nickname: 'RockyDad', avatar: 'MR', color: '#7c3aed', dogs: [{ name: 'Rocky', breed: 'Labrador', age: 12, avatar: '🐕' }] },
    { id: 'u5', name: 'Amy W.', nickname: 'CharlieMum', avatar: 'AW', color: '#27ae60', dogs: [{ name: 'Charlie', breed: 'Cavoodle', age: 8, avatar: '🐩' }] },
    { id: 'u6', name: 'David L.', nickname: 'MaxOwner', avatar: 'DL', color: '#e67e22', dogs: [{ name: 'Max', breed: 'Border Collie', age: 10, avatar: '🐕‍🦺' }] },
    { id: 'u7', name: 'Fiona S.', nickname: 'CocoCarer', avatar: 'FS', color: '#e91e63', dogs: [{ name: 'Coco', breed: 'Poodle', age: 13, avatar: '🐩' }, { name: 'Buddy', breed: 'Maltese', age: 7, avatar: '🐕' }] },
    { id: 'u8', name: 'Tom H.', nickname: 'OscarDad', avatar: 'TH', color: '#00bcd4', dogs: [{ name: 'Oscar', breed: 'French Bulldog', age: 9, avatar: '🐶' }] }
];

const MOCK_POSTS = [
    {
        id: 'old-mate-struggling-on-stairs',
        userId: 'u1',
        category: 'health-case',
        topic: '#JointHealth',
        title: 'Just noticed my old mate\'s been struggling on the stairs lately',
        excerpt: 'Charlie\'s 9-year-old Golden Retriever is struggling with stairs. Vet mentioned early arthritis. Seeking advice from anyone who\'s dealt with this.',
        content: 'Hey everyone. Bit of a downer post but I need some advice.\n\nCharlie is 9 now and I\'ve started noticing him really struggling on the stairs. He used to bound up no worries, but these days he hesitates at the top step like he\'s psyching himself up. Sometimes I catch him whimpering when he thinks I\'m not looking.\n\nTook him to the vet last month and she mentioned something about arthritis starting. She didn\'t seem too concerned but I am. Has anyone else been through this? What did you do?\n\nAre supplements worth it? I\'ve seen so many different brands at the pet shop and online.',
        dog: { name: 'Charlie', breed: 'Golden Retriever', age: 9, color: '#e67e22', initials: 'SM' },
        authorColor: '#e67e22',
        authorInitials: 'SM',
        authorName: 'Sarah M.',
        createdAt: 'just now',
        likes: 0,
        comments: 0,
        views: 0,
        tags: ["JointHealth", "GoldenRetriever", "SeniorDog"],
        pinned: false,
        verified: false,
        slug: 'old-mate-struggling-on-stairs'
    },
    {
        id: 'greyhound-osteoarthritis-diagnosis',
        userId: 'u1',
        category: 'health-case',
        topic: '#JointHealth',
        title: 'Finally got my greyhound diagnosed - osteoarthritis at 10',
        excerpt: 'Buster the 10-year-old Greyhound diagnosed with osteoarthritis in both hind legs. On anti-inflammatories and physio. Looking for shared experiences.',
        content: 'Long post coming, sorry in advance.\n\nBuster\'s been slowing down for about 6 months. I put it down to age but my missus kept saying something wasn\'t right. He started limping after his morning walks, then he\'d lie down halfway through and just refuse to move.\n\nFinally got him properly checked out. X-rays confirmed osteoarthritis in both hind legs. Devastating honestly. He\'s always been such an active dog.\n\nVet\'s put him on anti-inflammatories and we\'ve started physio. Anyone with greyhounds in similar situations? Would love to hear what\'s worked for your dogs.\n\nHow long did it take to see improvement?',
        dog: { name: 'Buster', breed: 'Greyhound', age: 10, color: '#2980b9', initials: 'MT' },
        authorColor: '#2980b9',
        authorInitials: 'MT',
        authorName: 'Mike T.',
        createdAt: 'just now',
        likes: 0,
        comments: 0,
        views: 0,
        tags: ["JointHealth", "Greyhound", "Osteoarthritis"],
        pinned: false,
        verified: false,
        slug: 'greyhound-osteoarthritis-diagnosis'
    },
    {
        id: 'bunnings-ramp-for-old-cavoodle',
        userId: 'u2',
        category: 'health-case',
        topic: '#JointHealth',
        title: 'This $45 Bunnings ramp changed everything for my old cavoodle',
        excerpt: 'Jess shares how a $45 Bunnings dog ramp brought Molly back to sleeping on the couch. Simple fix for an 11-year-old Cavoodle with mobility issues.',
        content: 'Fair warning - this is going to sound like an ad but I genuinely want to share because this worked absolute wonders for us.\n\nMolly couldn\'t get on the couch anymore. She\'s 11 and her back legs just weren\'t having it. She used to sleep next to me every night and then suddenly she couldn\'t jump up and would just sit there looking at me.\n\nSomeone on here mentioned Bunnings dog ramps so I grabbed a cheap $45 one. Slightly embarrassed to say I was skeptical. But within a WEEK Molly was back on the couch and sleeping next to me again.\n\nIf your old dog is struggling with height - please try one. It was such a simple fix and I wish I\'d done it sooner.',
        dog: { name: 'Molly', breed: 'Cavoodle', age: 11, color: '#8e44ad', initials: 'JR' },
        authorColor: '#8e44ad',
        authorInitials: 'JR',
        authorName: 'Jess R.',
        createdAt: 'just now',
        likes: 0,
        comments: 0,
        views: 0,
        tags: ["JointHealth", "Cavoodle", "MobilityAid"],
        pinned: false,
        verified: false,
        slug: 'bunnings-ramp-for-old-cavoodle'
    },
    {
        id: 'librela-injection-arthritis-experience',
        userId: 'u6',
        category: 'health-case',
        topic: '#JointHealth',
        title: 'Has anyone tried Librela injection for arthritis? Vets recommendation',
        excerpt: 'Vet recommended monthly Librela injection for Oscar\'s arthritis. Looking for owner experiences before committing - cost, side effects, interactions.',
        content: 'My vet recently suggested trying Librela for Oscar\'s arthritis. She said it\'s a monthly injection that targets nerve pain associated with OA. Has anyone used it?\n\nOscar\'s 8 and has had hip dysplasia since he was 2. We\'ve managed it with weight control and anti-inflammatories but his bad days are getting more frequent.\n\nWanted to get some real owner experiences before committing. What\'s the cost like? Any side effects I should know about? He\'s already on other meds so worried about interactions.\n\nAppreciate any insights from people who\'ve been down this path.',
        dog: { name: 'Oscar', breed: 'Labrador', age: 8, color: '#27ae60', initials: 'DK' },
        authorColor: '#27ae60',
        authorInitials: 'DK',
        authorName: 'David K.',
        createdAt: 'just now',
        likes: 0,
        comments: 0,
        views: 0,
        tags: ["JointHealth", "Labrador", "ArthritisTreatment"],
        pinned: false,
        verified: false,
        slug: 'librela-injection-arthritis-experience'
    },
    {
        id: 'swimming-hydrotherapy-senior-dog',
        userId: 'u5',
        category: 'health-case',
        topic: '#JointHealth',
        title: 'Swimming for senior dogs - game changer or waste of time?',
        excerpt: 'Vet physio recommended hydrotherapy for Ruby\'s hip issues. German Shepherd, 9 years old. Anyone tried dog swimming for joint health?',
        content: 'My vet physio suggested hydrotherapy for Ruby\'s joints and I\'m genuinely curious if it actually makes a difference.\n\nRuby\'s 9 GSD, hips aren\'t great. She\'s not in pain day-to-day but she struggles after long walks and her gait has definitely changed over the last year.\n\nThere\'s a hydrotherapy centre near me that does dog swimming sessions. Has anyone taken their senior dog swimming? Did you notice improvement in mobility or was it more about comfort?\n\nNot trying to spend money on something that won\'t help but if it genuinely makes a difference for her quality of life I\'ll do it in a heartbeat.',
        dog: { name: 'Ruby', breed: 'German Shepherd', age: 9, color: '#c0392b', initials: 'AW' },
        authorColor: '#c0392b',
        authorInitials: 'AW',
        authorName: 'Amy W.',
        createdAt: 'just now',
        likes: 0,
        comments: 0,
        views: 0,
        tags: ["JointHealth", "GermanShepherd", "Hydrotherapy"],
        pinned: false,
        verified: false,
        slug: 'swimming-hydrotherapy-senior-dog'
    },
    {
        id: 'kelpie-stiffness-at-7-years',
        userId: 'u8',
        category: 'health-case',
        topic: '#JointHealth',
        title: 'Worried I\'m imagining it - or is my kelpie slowing down?',
        excerpt: 'Duke the 7-year-old Kelpie seems stiffer in the mornings. Is 7 too young for arthritis signs? Seeking perspective from other kelpie owners.',
        content: 'Might be being overprotective here but bear with me.\n\nDuke\'s 7 and a working kelpie. He\'s still sharp as anything mentally but I\'ve noticed over the past few months he\'s a bit stiffer when he first gets up from lying down. Doesn\'t limp or anything but there\'s definitely a moment where he takes a beat before he starts moving.\n\nIs 7 too young for arthritis? Or am I just overthinking it? My mate who also has kelpies said 7 is still young but I\'m not sure.\n\nNot looking to rush to the vet for nothing but also don\'t want to ignore something if it\'s the start of something.',
        dog: { name: 'Duke', breed: 'Australian Kelpie', age: 7, color: '#16a085', initials: 'TB' },
        authorColor: '#16a085',
        authorInitials: 'TB',
        authorName: 'Tom B.',
        createdAt: 'just now',
        likes: 0,
        comments: 0,
        views: 0,
        tags: ["JointHealth", "Kelpie", "EarlySigns"],
        pinned: false,
        verified: false,
        slug: 'kelpie-stiffness-at-7-years'
    },
    {
        id: 'cavalier-night-coughing-heart',
        userId: 'u3',
        category: 'health-case',
        topic: '#HeartKidney',
        title: 'Night coughing for 3 weeks - vet says possible heart disease',
        excerpt: '10-year-old Cavalier King Charles Spaniel coughing at night. X-ray shows enlarged heart. Vet wants more tests. Seeking CKCS heart disease experiences.',
        content: 'Max has been coughing at night for about 3 weeks now. Started off as occasional, now it\'s almost every night. He sounds like he\'s trying to clear his throat.\n\nVet did x-rays and mentioned something about an enlarged heart. She wants to do more tests next week but didn\'t seem overly alarmed. I\'m absolutely terrified though.\n\nHas anyone had a CKCS with heart disease? What happened? How are they going now?\n\nI feel like I should be doing something right now but the vet said just to monitor. Is there anything I can do to help him sleep better at night?',
        dog: { name: 'Max', breed: 'Cavalier King Charles Spaniel', age: 10, color: '#e74c3c', initials: 'LP' },
        authorColor: '#e74c3c',
        authorInitials: 'LP',
        authorName: 'Linda P.',
        createdAt: 'just now',
        likes: 0,
        comments: 0,
        views: 0,
        tags: ["HeartKidney", "CKCS", "HeartDisease"],
        pinned: false,
        verified: false,
        slug: 'cavalier-night-coughing-heart'
    },
    {
        id: 'elevated-kidney-values-beagle',
        userId: 'u1',
        category: 'health-case',
        topic: '#HeartKidney',
        title: 'Blood test showed elevated kidney values - terrified',
        excerpt: 'Buddy\'s blood test showed Stage 2 kidney disease. 11-year-old Beagle still seems fine in himself. Terrified owner seeking support and advice.',
        content: 'Buddy had his annual blood test last week and the vet called me back about his kidney values. Creatinine and BUN both elevated. She mentioned something about Stage 2 kidney disease.\n\nI did NOT handle this news well. Cried in the car for 20 minutes after the call.\n\nShe\'s recommended a kidney support diet and wants to re-test in a month. Has anyone been through this? What\'s the progression like? How long did your dog manage with early-stage kidney disease?\n\nBuddy still seems fine in himself - eating, drinking, happy. I keep looking at him and trying not to fall apart.',
        dog: { name: 'Buddy', breed: 'Beagle', age: 11, color: '#8e44ad', initials: 'PH' },
        authorColor: '#8e44ad',
        authorInitials: 'PH',
        authorName: 'Peter H.',
        createdAt: 'just now',
        likes: 0,
        comments: 0,
        views: 0,
        tags: ["HeartKidney", "KidneyDisease", "Beagle"],
        pinned: false,
        verified: false,
        slug: 'elevated-kidney-values-beagle'
    },
    {
        id: 'grade-2-heart-murmur-labrador',
        userId: 'u1',
        category: 'health-case',
        topic: '#HeartKidney',
        title: 'Heart murmur grade 2 at 8 - how serious is this really?',
        excerpt: 'Grade 2 heart murmur found during emergency surgery. 8-year-old Labrador. Vet says monitor every 6 months. Seeking long-term perspective.',
        content: 'Luna had her desexing op last week (yes I know, late - she had pyometra so it was emergency) and the vet picked up a heart murmur while she was under. Grade 2 out of 6.\n\nThe vet said grade 2 is mild and not immediately concerning but I can\'t stop thinking about it. She wants to monitor every 6 months.\n\nHas anyone got a dog with a murmur at this grade? What\'s the long-term outlook? Does it progress? I feel like I should be doing something more proactive rather than just waiting.',
        dog: { name: 'Luna', breed: 'Labrador', age: 8, color: '#2980b9', initials: 'ES' },
        authorColor: '#2980b9',
        authorInitials: 'ES',
        authorName: 'Emma S.',
        createdAt: 'just now',
        likes: 0,
        comments: 0,
        views: 0,
        tags: ["HeartKidney", "HeartMurmur", "Labrador"],
        pinned: false,
        verified: false,
        slug: 'grade-2-heart-murmur-labrador'
    },
    {
        id: 'border-collie-drinking-more-water',
        userId: 'u1',
        category: 'health-case',
        topic: '#HeartKidney',
        title: 'Drinking heaps more water lately - should I be worried?',
        excerpt: 'Cooper drinking twice as much water as before. 9-year-old Border Collie. Possible kidney, diabetes or Cushings. Vet appointment booked.',
        content: 'Noticed Cooper\'s been drinking way more water than usual over the past month or so. Like, I have to fill his bowl twice a day now when he used to barely finish it once.\n\nAlso peeing more frequently obviously. He\'s a 9-year-old Border Collie, still working him lightly but now I\'m paranoid.\n\nRead online this could be kidneys, could be diabetes, could be Cushings. All sound terrifying. Vet appointment next week but in the meantime has anyone experienced this with their senior collie?',
        dog: { name: 'Cooper', breed: 'Border Collie', age: 9, color: '#27ae60', initials: 'CJ' },
        authorColor: '#27ae60',
        authorInitials: 'CJ',
        authorName: 'Chris J.',
        createdAt: 'just now',
        likes: 0,
        comments: 0,
        views: 0,
        tags: ["HeartKidney", "BorderCollie", "ExcessiveThirst"],
        pinned: false,
        verified: false,
        slug: 'border-collie-drinking-more-water'
    },
    {
        id: 'cardiologist-visit-cost-breakdown',
        userId: 'u1',
        category: 'health-case',
        topic: '#HeartKidney',
        title: 'Cardiologist visit cost breakdown - so you know what to expect',
        excerpt: 'Honest cost breakdown from a recent cardiologist visit for Freddie\'s heart condition. $480 initial consult, $95 tests, $120 follow-up.',
        content: 'Just got back from a specialist cardiology appointment with Freddie and wanted to share the cost breakdown because I went in completely blind and was shocked by the bill.\n\nInitial consult with echocardiogram: $480\nBlood tests (proBNP): $95\nFollow-up consult: $120\nMonthly vet check: $65\n\nTotal first year is going to be around $1,400 with medications on top.\n\nI love Freddie more than anything but if you\'re budgeting for this - factor in at least $500 for the first visit alone. Happy to answer questions about what the process was like if anyone is heading that direction.',
        dog: { name: 'Freddie', breed: 'Miniature Schnauzer', age: 11, color: '#e67e22', initials: 'NF' },
        authorColor: '#e67e22',
        authorInitials: 'NF',
        authorName: 'Nicole F.',
        createdAt: 'just now',
        likes: 0,
        comments: 0,
        views: 0,
        tags: ["HeartKidney", "Cardiology", "Schnauzer"],
        pinned: false,
        verified: false,
        slug: 'cardiologist-visit-cost-breakdown'
    },
    {
        id: 'multiple-medications-senior-dog',
        userId: 'u1',
        category: 'health-case',
        topic: '#HeartKidney',
        title: 'My old mate is on 4 medications now - anyone else managing this?',
        excerpt: '12-year-old Staffy on 4 different medications daily. Exhausted owner seeking tips for managing multiple medications and medication scheduling.',
        content: 'Harley\'s 12 and a half. He\'s on heart medication, a diuretic, something for his kidneys and gabapentin for his back. That\'s 4 different medications, some twice a day.\n\nI feel like I\'m running a pharmacy. Scheduling is a nightmare. Does anyone else have their senior dog on multiple medications? How do you manage? Any tips for getting him to take them without a fight?\n\nHe\'s doing well all things considered but managing the meds is exhausting. Would love to know I\'m not alone in this.',
        dog: { name: 'Harley', breed: 'Staffordshire Bull Terrier', age: 12, color: '#c0392b', initials: 'RW' },
        authorColor: '#c0392b',
        authorInitials: 'RW',
        authorName: 'Rob W.',
        createdAt: 'just now',
        likes: 0,
        comments: 0,
        views: 0,
        tags: ["HeartKidney", "SeniorDog", "MedicationManagement"],
        pinned: false,
        verified: false,
        slug: 'multiple-medications-senior-dog'
    },
    {
        id: 'golden-retriever-persistent-scratching',
        userId: 'u1',
        category: 'health-case',
        topic: '#SkinCare',
        title: 'Golden retriever won\'t stop scratching - we\'ve tried everything',
        excerpt: '7-year-old Golden Retriever scratching for 4 months. Vet found no parasites. Steroids helped temporarily. Food change didn\'t work.',
        content: 'Archie has been scratching himself raw for about 4 months now. We\'re at our wits end.\n\nHe\'s broken the skin on his back legs and sides. The vet gave us steroids which helped short-term but it came back as soon as we finished the course. She\'s done skin scrapings and said no mites or parasites.\n\nWe\'ve changed his food to salmon and rice (expensive stuff), we\'ve tried oat baths, coconut oil, everything at the pet shop. Nothing works long-term.\n\nHas anyone dealt with persistent scratching in Golden Retrievers? Is there a specialist we should see? I feel terrible for him.',
        dog: { name: 'Archie', breed: 'Golden Retriever', age: 7, color: '#f39c12', initials: 'MT' },
        authorColor: '#f39c12',
        authorInitials: 'MT',
        authorName: 'Michelle T.',
        createdAt: 'just now',
        likes: 0,
        comments: 0,
        views: 0,
        tags: ["SkinCare", "GoldenRetriever", "Allergies"],
        pinned: false,
        verified: false,
        slug: 'golden-retriever-persistent-scratching'
    },
    {
        id: 'german-shepherd-recurring-hot-spots',
        userId: 'u2',
        category: 'health-case',
        topic: '#SkinCare',
        title: 'Hot spots keep coming back every summer - predictable pattern',
        excerpt: 'German Shepherd gets hot spots every summer. Same spot, same time. Seeking proactive prevention tips for the upcoming summer season.',
        content: 'Zeus gets hot spots every single summer without fail. Same spot on his hip, turns into a raw weeping mess within days. We treat it, it heals, next January it comes back.\n\nIt\'s become so predictable I almost set a calendar reminder. Vets have checked for allergies but nothing conclusive. They said it might just be heat and humidity related.\n\nThis summer I want to be more proactive. Does anyone have a prevention protocol that actually works? I hate seeing him in discomfort and I know the steroids can\'t be good for him long-term.',
        dog: { name: 'Zeus', breed: 'German Shepherd', age: 8, color: '#2980b9', initials: 'JL' },
        authorColor: '#2980b9',
        authorInitials: 'JL',
        authorName: 'James L.',
        createdAt: 'just now',
        likes: 0,
        comments: 0,
        views: 0,
        tags: ["SkinCare", "GermanShepherd", "HotSpots"],
        pinned: false,
        verified: false,
        slug: 'german-shepherd-recurring-hot-spots'
    },
    {
        id: 'shih-tzu-coat-thinning-senior',
        userId: 'u1',
        category: 'health-case',
        topic: '#SkinCare',
        title: 'Isapooy coat has gone really thin - should I panic?',
        excerpt: '10-year-old Shih Tzu coat has thinned dramatically. Otherwise healthy. Wondering if thyroid or just normal ageing. Seeking advice.',
        content: 'Coco\'s beautiful fluffy coat has really thinned out over the last 6 months. You can almost see her skin through it now. She\'s always had the most gorgeous double coat and now she just looks... old.\n\nShe\'s 10, otherwise healthy, eating fine, same energy. But the coat thing really bothers me. Is this just normal ageing or could it be a thyroid issue?\n\nVet\'s not concerned but I am. Has anyone had their senior Shih Tzu go through this? What helped?',
        dog: { name: 'Coco', breed: 'Shih Tzu', age: 10, color: '#9b59b6', initials: 'RK' },
        authorColor: '#9b59b6',
        authorInitials: 'RK',
        authorName: 'Rachel K.',
        createdAt: 'just now',
        likes: 0,
        comments: 0,
        views: 0,
        tags: ["SkinCare", "ShihTzu", "CoatHealth"],
        pinned: false,
        verified: false,
        slug: 'shih-tzu-coat-thinning-senior'
    },
    {
        id: 'raw-diet-cleared-staffy-skin',
        userId: 'u1',
        category: 'health-case',
        topic: '#SkinCare',
        title: 'Raw food diet cleared up my Staffy\'s skin - anyone else tried this?',
        excerpt: 'Switched 6-year-old Staffy to raw food diet after chronic skin issues. Dramatic improvement in 3 months. Sharing experience and curious about others.',
        content: 'Not usually one to jump on food trends but Rex\'s skin was absolutely hopeless. Red, itchy, constant ear infections. Vet bills were mounting.\n\nSwitched him to raw about 3 months ago on a friend\'s recommendation and honestly the difference has been remarkable. Coat\'s shinier, he\'s not scratching constantly, even his breath smells better.\n\nI know raw is controversial and it is more expensive and more work. But for us it was worth it. Has anyone else had similar success? Or the opposite experience?',
        dog: { name: 'Rex', breed: 'Staffordshire Bull Terrier', age: 6, color: '#e74c3c', initials: 'BM' },
        authorColor: '#e74c3c',
        authorInitials: 'BM',
        authorName: 'Ben M.',
        createdAt: 'just now',
        likes: 0,
        comments: 0,
        views: 0,
        tags: ["SkinCare", "RawFood", "Staffy"],
        pinned: false,
        verified: false,
        slug: 'raw-diet-cleared-staffy-skin'
    },
    {
        id: 'allergy-test-paw-licking-diagnosis',
        userId: 'u1',
        category: 'health-case',
        topic: '#SkinCare',
        title: 'Licked his paws until they bled - finally got a proper diagnosis',
        excerpt: 'Milo licked his paws for 2 years. Three vets, no answers. Saw a dermatologist, got proper allergy testing. Found grass seed and mould allergies.',
        content: 'Posting this because I WISH someone had told me this 2 years ago.\n\nMilo was licking his paws constantly. I thought it was anxiety, then allergies, then boredom. Took him to three vets. Tried elimination diets, Apoquel, everything.\n\nFinally went to a dermatologist. Turned out he had a grass seed allergy AND a environmental mould allergy. Two years of suffering because no one tested properly.\n\nIf your dog is obsessively licking paws and you\'ve tried everything - please consider a proper allergy test. It cost us $350 but we got answers. Milo is a different dog now.',
        dog: { name: 'Milo', breed: 'Labradoodle', age: 5, color: '#16a085', initials: 'SG' },
        authorColor: '#16a085',
        authorInitials: 'SG',
        authorName: 'Sophie G.',
        createdAt: 'just now',
        likes: 0,
        comments: 0,
        views: 0,
        tags: ["SkinCare", "AllergyTest", "Labradoodle"],
        pinned: false,
        verified: false,
        slug: 'allergy-test-paw-licking-diagnosis'
    },
    {
        id: 'oatmeal-baths-itchy-dogs',
        userId: 'u1',
        category: 'health-case',
        topic: '#SkinCare',
        title: 'Oatmeal baths for itchy dogs - does it actually work?',
        excerpt: 'Regular oatmeal baths for Poppy\'s itchy skin. Seems to help but is there science behind it? Seeking evidence-based perspective on home remedies.',
        content: 'My mum swears by oatmeal baths for Poppy\'s itchy skin. She makes this whole paste from colloidal oatmeal and I honestly feel ridiculous doing it but Poppy seems to enjoy the bath and does seem a bit more comfortable after.\n\nPartner thinks I\'m wasting my time. Is there any actual evidence it helps or is this just a nice bonding ritual? Not going to stop either way but curious what the science says.',
        dog: { name: 'Poppy', breed: 'Labrador', age: 9, color: '#8e44ad', initials: 'DP' },
        authorColor: '#8e44ad',
        authorInitials: 'DP',
        authorName: 'Danielle P.',
        createdAt: 'just now',
        likes: 0,
        comments: 0,
        views: 0,
        tags: ["SkinCare", "Labrador", "HomeRemedy"],
        pinned: false,
        verified: false,
        slug: 'oatmeal-baths-itchy-dogs'
    },
    {
        id: 'when-switch-senior-food-border-collie',
        userId: 'u4',
        category: 'tip',
        topic: '#DailyCare',
        title: 'When did you switch your dog to senior food? Is 7 actually old?',
        excerpt: '7-year-old Border Collie still acts like a puppy. Vet mentioned senior food. Is 7 actually old for a collie? Struggling with the mental shift.',
        content: 'Bella\'s 7 and the vet mentioned she should be on senior food. I looked at the label and it said for dogs 7+. She doesn\'t look old to me at all - still runs around like a maniac at the park.\n\nIs 7 actually old for a border collie? I keep thinking about when I got her as a puppy and it feels like yesterday. When did you make the switch? Does it actually matter that much?\n\nGenuinely struggling with the mental shift of thinking of her as a senior dog.',
        dog: { name: 'Bella', breed: 'Border Collie', age: 7, color: '#27ae60', initials: 'MH' },
        authorColor: '#27ae60',
        authorInitials: 'MH',
        authorName: 'Mark H.',
        createdAt: 'just now',
        likes: 0,
        comments: 0,
        views: 0,
        tags: ["DailyCare", "SeniorFood", "BorderCollie"],
        pinned: false,
        verified: false,
        slug: 'when-switch-senior-food-border-collie'
    },
    {
        id: 'hiding-dog-medication-tricks',
        userId: 'u1',
        category: 'tip',
        topic: '#DailyCare',
        title: 'Tips for giving a senior dog their medication disguised in food?',
        excerpt: '10-year-old CKCS has figured out every medication hiding trick. What\'s worked for your clever stubborn senior dog? Need fresh ideas.',
        content: 'Molly needs to take heart medication twice a day and she\'s absolutely onto me. Wrapping it in cheese - works for exactly 2 days then she spits it out. Peanut butter - same. Pill pockets from the pet shop - she figured those out too.\n\nShe now eyes every treat with suspicion. It\'s like living with a tiny furry detective.\n\nWhat are your tricks? I need variety because she\'s learning fast. What\'s worked for your stubborn senior dog?',
        dog: { name: 'Molly', breed: 'Cavalier King Charles Spaniel', age: 10, color: '#e67e22', initials: 'HC' },
        authorColor: '#e67e22',
        authorInitials: 'HC',
        authorName: 'Helen C.',
        createdAt: 'just now',
        likes: 0,
        comments: 0,
        views: 0,
        tags: ["DailyCare", "MedicationTips", "CKCS"],
        pinned: false,
        verified: false,
        slug: 'hiding-dog-medication-tricks'
    },
    {
        id: 'best-elevated-bowls-arthritic-dog',
        userId: 'u1',
        category: 'tip',
        topic: '#DailyCare',
        title: 'Best elevated dog bowls for arthritic dogs?',
        excerpt: 'Vet recommended elevated bowls for Barney\'s joints. French Bulldog, 8 years old. Looking for stable, good-quality recommendations.',
        content: 'Barney\'s vet mentioned raised bowls might be easier on his joints when he\'s eating. He\'s 8 and has started to struggle getting down to floor level.\n\nHas anyone got recommendations for good elevated bowl stands? Looking for something stable - Barney\'s a bit of a clutz and I\'m worried he\'ll knock it over.\n\nAlso wondering if the height actually makes a meaningful difference or if this is more of a comfort thing? Happy to spend a bit if it\'ll help him.',
        dog: { name: 'Barney', breed: 'French Bulldog', age: 8, color: '#3498db', initials: 'KS' },
        authorColor: '#3498db',
        authorInitials: 'KS',
        authorName: 'Kevin S.',
        createdAt: 'just now',
        likes: 0,
        comments: 0,
        views: 0,
        tags: ["DailyCare", "ArthritisSupport", "FrenchBulldog"],
        pinned: false,
        verified: false,
        slug: 'best-elevated-bowls-arthritic-dog'
    },
    {
        id: 'daily-teeth-brushing-senior-dog',
        userId: 'u1',
        category: 'tip',
        topic: '#DailyCare',
        title: 'How often do you brush your senior dog\'s teeth? Dentist says daily',
        excerpt: 'Vet recommends daily teeth brushing for 11-year-old Pomeranian. Dental disease risks discussed. Tips for making daily brushing less stressful?',
        content: 'Took Tilly for a dental check and the vet said she needs daily brushing. Daily! I\'ve been doing it maybe twice a week which I thought was pretty good.\n\nThe vet showed me her teeth and honestly some of the back ones have a lot of tartar. She said untreated dental disease can affect the heart and kidneys which terrified me.\n\nFor those of you who brush daily - does your dog actually cooperate? Tilly\'s pretty good but getting behind those back molars is a battle. Any tips for making it less stressful for both of us?',
        dog: { name: 'Tilly', breed: 'Pomeranian', age: 11, color: '#e74c3c', initials: 'AM' },
        authorColor: '#e74c3c',
        authorInitials: 'AM',
        authorName: 'Angela M.',
        createdAt: 'just now',
        likes: 0,
        comments: 0,
        views: 0,
        tags: ["DailyCare", "DentalHealth", "Pomeranian"],
        pinned: false,
        verified: false,
        slug: 'daily-teeth-brushing-senior-dog'
    },
    {
        id: 'car-ramp-for-small-senior-dog',
        userId: 'u1',
        category: 'tip',
        topic: '#DailyCare',
        title: 'Ramp for car - is it worth getting one? Mine hates the boot',
        excerpt: '12-year-old Maltese struggling with car boot. Considering a ramp but worried dog won\'t use it. Successful ramp training experiences?',
        content: 'Ginger\'s 12 and getting into the car boot is getting harder for her. She\'s a small dog so I\'ve always just lifted her but my back isn\'t what it used to be either.\n\nLooking at getting a ramp but not sure if she\'ll actually use it. She\'s set in her ways. Has anyone successfully transitioned their old dog to a ramp? What brand did you get?\n\nAlso worried she might try to jump anyway and hurt herself. How long did it take for your dog to trust the ramp?',
        dog: { name: 'Ginger', breed: 'Maltese', age: 12, color: '#f39c12', initials: 'PR' },
        authorColor: '#f39c12',
        authorInitials: 'PR',
        authorName: 'Paul R.',
        createdAt: 'just now',
        likes: 0,
        comments: 0,
        views: 0,
        tags: ["DailyCare", "CarRamp", "Maltese"],
        pinned: false,
        verified: false,
        slug: 'car-ramp-for-small-senior-dog'
    },
    {
        id: 'mentally-stimulating-old-dog',
        userId: 'u1',
        category: 'tip',
        topic: '#DailyCare',
        title: 'How do you mentally stimulate an old dog who\'s slowing down physically?',
        excerpt: '10-year-old Blue Heeler physically slowing down but mentally very alert. Needs more mental stimulation. Seeking enrichment activity ideas.',
        content: 'Dusty\'s 10 and her body is slowing down but her brain is still SO sharp. She gets bored easily and I can see it - pacing, restless, sometimes destructive.\n\nWe can\'t do long walks anymore and I feel guilty leaving her home alone with not much to do. What do you do to mentally enrich your senior dog\'s day?\n\nShe\'s always loved puzzle toys and learning tricks but I\'m running out of ideas. Looking for fresh suggestions.',
        dog: { name: 'Dusty', breed: 'Blue Heeler', age: 10, color: '#16a085', initials: 'FW' },
        authorColor: '#16a085',
        authorInitials: 'FW',
        authorName: 'Fiona W.',
        createdAt: 'just now',
        likes: 0,
        comments: 0,
        views: 0,
        tags: ["DailyCare", "MentalStimulation", "BlueHeeler"],
        pinned: false,
        verified: false,
        slug: 'mentally-stimulating-old-dog'
    },
    {
        id: 'senior-dog-refusing-kibble',
        userId: 'u1',
        category: 'tip',
        topic: '#FoodNutrition',
        title: 'Dog suddenly refusing his kibble - any ideas?',
        excerpt: '9-year-old Bull Arab suddenly refusing his usual kibble. Warming it up helps. Could indicate health issue or just senior pickiness?',
        content: 'Bruno\'s 9 and has eaten the same dry food his whole life without complaint. All of a sudden he\'s turning his nose up at it. Same brand, same flavour, same bowl. Just... refusing.\n\nWe\'ve tried warming it up slightly, adding a bit of hot water. He\'ll eat it that way but I feel like I\'m giving in.\n\nCould this be a sign of something? He\'s drinking fine, energy seems normal. Or is this just senior dog pickiness? Has anyone else dealt with sudden food refusal?',
        dog: { name: 'Bruno', breed: 'Bull Arab', age: 9, color: '#c0392b', initials: 'GT' },
        authorColor: '#c0392b',
        authorInitials: 'GT',
        authorName: 'Gary T.',
        createdAt: 'just now',
        likes: 0,
        comments: 0,
        views: 0,
        tags: ["FoodNutrition", "BullArab", "SeniorDog"],
        pinned: false,
        verified: false,
        slug: 'senior-dog-refusing-kibble'
    },
    {
        id: 'fresh-food-diet-senior-labrador',
        userId: 'u1',
        category: 'tip',
        topic: '#FoodNutrition',
        title: 'Has anyone switched to fresh/freeze-dried food? Cost vs benefit?',
        excerpt: 'Healthy 8-year-old Labrador on regular dry food. Considering fresh food diet. Is the 3x cost justified? Seeking honest experiences from people who\'ve switched.',
        content: 'Zara\'s been on regular dry food her whole life. She\'s healthy, good weight, vet\'s always been happy. But I\'ve been reading about fresh food diets and wondering if I\'m missing something.\n\nThe cost is significantly more - like 3x what I\'m paying now. Is it actually worth it for an otherwise healthy dog? Or am I being marketed to?\n\nInterested in hearing from people who\'ve made the switch - what changed (if anything)? Did your dog seem better? Worse? Same?',
        dog: { name: 'Zara', breed: 'Labrador', age: 8, color: '#8e44ad', initials: 'KP' },
        authorColor: '#8e44ad',
        authorInitials: 'KP',
        authorName: 'Kate P.',
        createdAt: 'just now',
        likes: 0,
        comments: 0,
        views: 0,
        tags: ["FoodNutrition", "FreshFood", "Labrador"],
        pinned: false,
        verified: false,
        slug: 'fresh-food-diet-senior-labrador'
    },
    {
        id: 'bone-broth-senior-dog-joints',
        userId: 'u1',
        category: 'tip',
        topic: '#FoodNutrition',
        title: 'Homemade bone broth - is it actually good for old dogs?',
        excerpt: 'Mum makes bone broth for 11-year-old Cattle Dog. Claimed benefits for joints. Seeking evidence on whether bone broth actually helps senior dogs.',
        content: 'My mum\'s been making bone broth for Maggie and says it\'s brilliant for old dogs\' joints. She\'s been giving Maggie a spoonful with her dinner for years.\n\nIs there actual evidence behind this or is it one of those grandma remedies? I don\'t want to dismiss it if it\'s genuinely helpful but also don\'t want to give Maggie something unnecessary.\n\nAnyone know if bone broth actually helps with joint health in senior dogs?',
        dog: { name: 'Maggie', breed: 'Australian Cattle Dog', age: 11, color: '#e67e22', initials: 'SL' },
        authorColor: '#e67e22',
        authorInitials: 'SL',
        authorName: 'Sandra L.',
        createdAt: 'just now',
        likes: 0,
        comments: 0,
        views: 0,
        tags: ["FoodNutrition", "BoneBroth", "JointHealth"],
        pinned: false,
        verified: false,
        slug: 'bone-broth-senior-dog-joints'
    },
    {
        id: 'fish-oil-dosage-senior-dog',
        userId: 'u1',
        category: 'tip',
        topic: '#FoodNutrition',
        title: 'Fish oil supplements - how much is too much?',
        excerpt: '7-year-old Rottweiler on fish oil for joints. Conflicting dosing advice online. What dose works for your large senior dog?',
        content: 'Started Bruno on fish oil for his joints on the vet\'s recommendation. She said 1 capsule a day but I keep reading conflicting things online about omega-3 dosing for dogs.\n\nSome sites say you can give more, some say it\'s dangerous. Bruno\'s about 45kg so I know size matters.\n\nWhat dose do you give your senior dog? Has anyone noticed actual visible improvements - shinier coat, better movement? How long did it take?',
        dog: { name: 'Bruno', breed: 'Rottweiler', age: 7, color: '#2980b9', initials: 'VN' },
        authorColor: '#2980b9',
        authorInitials: 'VN',
        authorName: 'Victor N.',
        createdAt: 'just now',
        likes: 0,
        comments: 0,
        views: 0,
        tags: ["FoodNutrition", "FishOil", "Rottweiler"],
        pinned: false,
        verified: false,
        slug: 'fish-oil-dosage-senior-dog'
    },
    {
        id: 'training-treats-for-senior-dog',
        userId: 'u1',
        category: 'tip',
        topic: '#FoodNutrition',
        title: 'Dog biscuits as training treats - okay for a 10-year-old?',
        excerpt: 'Still training 10-year-old Jack Russell with biscuits. Worried about additives and whether there are better treat options for senior dogs.',
        content: 'Poppy\'s 10 but we still do daily training with her because it keeps her mind active. We use small dog biscuits as rewards.\n\nAre these okay for a 10-year-old? I worry about the ingredients - some of them have quite a few additives. Is there a better treat option for senior dogs that still works for training?\n\nShe responds really well to food rewards so I\'d rather not switch methods entirely.',
        dog: { name: 'Poppy', breed: 'Jack Russell Terrier', age: 10, color: '#9b59b6', initials: 'MG' },
        authorColor: '#9b59b6',
        authorInitials: 'MG',
        authorName: 'Maria G.',
        createdAt: 'just now',
        likes: 0,
        comments: 0,
        views: 0,
        tags: ["FoodNutrition", "TrainingTreats", "JackRussell"],
        pinned: false,
        verified: false,
        slug: 'training-treats-for-senior-dog'
    },
    {
        id: 'daily-feeding-schedule-13-year-old-staffy',
        userId: 'u1',
        category: 'tip',
        topic: '#FoodNutrition',
        title: 'Complete guide: what I feed my 13-year-old staffy every single day',
        excerpt: 'Steve shares his complete daily feeding schedule for 13-year-old Staffy. Senior kibble, sardines, chicken, glucosamine. Dog is thriving with excellent blood results.',
        content: 'Roscoe\'s 13 and still going strong. I get a lot of questions about what he eats so here\'s my daily feeding breakdown.\n\nMorning: 1 cup senior kibble (low calorie because he\'s less active) + half a tin of wet food mixed in\nAfternoon: Sardines in spring water (small tin) - great for omega 3s\nEvening: 1 cup senior kibble + a spoonful of boiled chicken\nPlus: Glucosamine supplement in his dinner, fresh water changed 3 times a day\n\nHe\'s maintained a healthy weight, coat\'s in great condition, vet says his bloods are excellent. I know every dog is different but happy to share more details if useful.',
        dog: { name: 'Roscoe', breed: 'Staffordshire Bull Terrier', age: 13, color: '#27ae60', initials: 'SD' },
        authorColor: '#27ae60',
        authorInitials: 'SD',
        authorName: 'Steve D.',
        createdAt: 'just now',
        likes: 0,
        comments: 0,
        views: 0,
        tags: ["FoodNutrition", "SeniorDiet", "Staffy"],
        pinned: false,
        verified: false,
        slug: 'daily-feeding-schedule-13-year-old-staffy'
    }
];

const MOCK_COMMENTS = {
    'p1': [
        { userId: 'u3', text: 'This is so encouraging! My Bella\'s vet just mentioned supplements and I\'ve been wondering if they actually work. Glad to hear Milo is doing well 💙', time: '1 hour ago' },
        { userId: 'u5', text: 'The swimming tip is GOLD. Charlie hates baths but loves the beach. Going to start swimming sessions more regularly!', time: '2 hours ago' },
        { userId: 'u7', text: 'What brand of green-lipped mussel do you use? My vet recommended it but there are so many options online', time: '2 hours ago' },
        { userId: 'u1', text: '@BellaLover We use Nutra-Life Green Lipped Mussel from Chemist Warehouse. Make sure it\'s the powdered form, not capsules — better absorption.', time: '2 hours ago' }
    ],
    'p2': [
        { userId: 'u4', text: 'Early detection really is everything. Rocky\'s kidney issue was caught at Stage 2 three years ago and he\'s still going strong. Hoping the same for Bella! 🩺', time: '4 hours ago' },
        { userId: 'u1', text: 'I had no idea skin issues could be a kidney symptom. Sharing this post so more people see it. pinning to my profile.', time: '5 hours ago' },
        { userId: 'u6', text: 'What did the renal diet cost per month if you don\'t mind me asking? Trying to budget for this possibility with Max.', time: '6 hours ago' }
    ],
    'p3': [
        { userId: 'u7', text: 'DukeDad — Duke\'s symptoms sound almost exactly like Oscar. Oscar has a Grade 4 murmur and the cardiologist said coughing after exercise is common. Don\'t panic yet, get the full echo done. 🤞', time: '6 hours ago' },
        { userId: 'u4', text: 'Rocky had a Grade 3 murmur diagnosed at age 10. He\'s 12 now and still doing well on medication. Large breeds can live comfortably for years with the right management.', time: '7 hours ago' },
        { userId: 'u8', text: 'Sending positive vibes. Two weeks will feel long but the cardiologist will give you much clearer answers. In the meantime — keep walks short and cool (not hot).', time: '7 hours ago' }
    ]
};

const CATEGORY_CONFIG = {
    'health-case': { label: 'Health Case', icon: '📋', color: '#ff6b6b', desc: 'Share your dog\'s health journey' },
    'question': { label: 'Q&A', icon: '❓', color: '#4a9eb8', desc: 'Ask the community for advice' },
    'tip': { label: 'Tips', icon: '💡', color: '#7c3aed', desc: 'Share what worked for you' },
    'product': { label: 'Product Review', icon: '⭐', color: '#27ae60', desc: 'Reviews of beds, supplements, food' }
};

// ============================================================
// DATABASE CONNECTOR — 第三方接入时替换以下函数即可
// ============================================================
const CommunityDB = {
    /**
     * 获取帖子列表
     * @param {Object} filters - { category, limit, offset }
     * @returns {Promise<Array>} posts
     * 数据库接口：community_db_port（posts 表）
     */
    async getPosts(filters = {}) {
        // 临时返回 mock 数据
        // 未来替换为：
        // const { data } = await window.sb.from('posts')
        //   .select('*, users(nickname, avatar, color), dogs(name, breed)')
        //   .eq('is_published', true)
        //   .order('created_at', { ascending: false });
        // return data;
        var posts = MOCK_POSTS.slice();
        if (filters.category && filters.category !== 'all') {
            posts = posts.filter(function(p) { return p.category === filters.category; });
        }
        return posts;
    },

    /**
     * 获取单个帖子详情（含评论）
     * @param {string} postId
     * @returns {Promise<Object>} post with comments
     * 数据库接口：community_db_port（posts + comments 表）
     */
    async getPost(postId) {
        // 未来替换为 Supabase join query
        return MOCK_POSTS.find(function(p) { return p.id === postId; }) || null;
    },

    /**
     * 获取帖子评论
     * @param {string} postId
     * @returns {Promise<Array>} comments
     * 数据库接口：community_db_port（comments 表）
     */
    async getComments(postId) {
        // 未来替换为：
        // const { data } = await window.sb.from('comments')
        //   .select('*, users(nickname, avatar)')
        //   .eq('post_id', postId)
        //   .order('created_at', { ascending: true });
        // return data;
        return MOCK_COMMENTS[postId] || [];
    },

    /**
     * 发布新帖子
     * @param {Object} postData - { title, content, category, dogName, dogBreed }
     * @returns {Promise<Object>} created post
     * 数据库接口：community_db_port（posts 表）
     */
    async createPost(postData) {
        // 未来替换为：
        // const { data, error } = await window.sb.from('posts').insert([{
        //   title: postData.title,
        //   content: postData.content,
        //   category: postData.category,
        //   user_id: (await window.sb.auth.getUser()).data.user.id,
        //   dog_name: postData.dogName,
        //   dog_breed: postData.dogBreed,
        //   is_published: true
        // }]).select().single();
        // return data;
        return { id: 'new_' + Date.now(), ...postData };
    },

    /**
     * 提交评论
     * @param {string} postId
     * @param {string} text
     * @returns {Promise<Object>} created comment
     * 数据库接口：community_db_port（comments 表）
     */
    async addComment(postId, text) {
        // 未来替换为：
        // const { data } = await window.sb.from('comments').insert([{
        //   post_id: postId,
        //   user_id: (await window.sb.auth.getUser()).data.user.id,
        //   text: text
        // }]).select().single();
        // return data;
        return { id: 'c_' + Date.now(), postId: postId, text: text, time: 'Just now' };
    },

    /**
     * 点赞帖子
     * @param {string} postId
     * 数据库接口：community_db_port（posts.likes_count）
     */
    async likePost(postId) {
        // 未来替换为：
        // await window.sb.rpc('increment_likes', { post_id: postId });
    }
};
