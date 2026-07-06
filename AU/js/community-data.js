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
        id: 'p1', userId: 'u1', category: 'health-case',
        title: 'Milo\'s arthritis journey — 18 months of natural supplements, here\'s what worked',
        excerpt: 'After being diagnosed with moderate arthritis at age 10, Milo has been on a combination of glucosamine, MSM and fish oil for 18 months...',
        content: `Our vet confirmed moderate osteoarthritis in Milo's hips and elbows last year. He was slowing down on walks, struggling to get up from his bed, and seemed stiff after rest.\n\nHere's what we've been doing for the past 18 months:\n\n**Morning routine:**\nWe give him 1 teaspoon of fish oil (omega-3) mixed into his breakfast. He doesn't notice it at all.\n\n**Supplements:**\n- Glucosamine & Chondroitin: 1000mg/day\n- MSM: 500mg/day\n- Green-lipped mussel: 1 capsule/day\n\n**Exercise:**\nShort 20-minute walks on soft grass, never on concrete. He loves swimming in our backyard pool — the vet said it's the best exercise for arthritic dogs.\n\n**Results:**\nHe's like a new dog. Still not a puppy, but he gets up easily, runs in the garden, and has a spring in his step again. The key is consistency — we never skip the supplements.\n\nHappy to answer any questions from fellow dog parents going through this. 💙`,
        dog: MOCK_USERS[0].dogs[0], createdAt: '2 hours ago', likes: 47, comments: 12, views: 312, tags: ['Arthritis', 'Supplements', 'Recovery'],
        pinned: false, verified: false
    },
    {
        id: 'p2', userId: 'u3', category: 'health-case',
        title: 'Bella diagnosed with early-stage kidney disease — what the vet told us',
        excerpt: 'Blood tests showed elevated creatinine and BUN. Our vet said we caught it very early. Sharing our experience because early detection made all the difference...',
        content: `Bella had her annual senior blood panel last week and the results came back showing early-stage CKD (Stage 1-2).\n\n**What the vet explained:**\n- Her creatinine was slightly elevated (1.5 mg/dL, normal is <1.4 for her size)\n- BUN was also marginally up\n- SDMA test confirmed early kidney function change\n\n**The good news:**\nBecause we caught it so early, the vet said we can manage it entirely through diet and monitoring. No medication needed yet.\n\n**Changes we made immediately:**\n1. Switched to Royal Canin Renal Support wet food\n2. Added extra water bowls around the house (she's already drinking more)\n3. Booked follow-up blood work in 3 months instead of annually\n\n**Our vet's advice:**\n"Don't google scary statistics — every dog is different. With early detection and the right diet, many dogs live comfortably for years."\n\nIf your senior dog is over 7, please please book a senior blood panel. It's not expensive and it could save their life. 🩺`,
        dog: MOCK_USERS[2].dogs[0], createdAt: '5 hours ago', likes: 83, comments: 21, views: 541, tags: ['Kidney Disease', 'Early Detection', 'Diet'],
        pinned: true, verified: false
    },
    {
        id: 'p3', userId: 'u2', category: 'question',
        title: 'Duke started coughing after exercise — heart murmur or just age?',
        excerpt: 'My 9-year-old German Shepherd has developed a soft cough that gets worse after our walks. Vet heard a Grade 2 murmur. Should I be worried?',
        content: `Hey everyone, looking for advice from dog parents who've been through this.\n\nDuke is 9 (German Shepherd, 38kg) and in otherwise great shape. He goes on 40-minute walks daily and has always been healthy.\n\nOver the past 3 weeks he's developed a soft, moist cough that comes on after walks and at night when he's lying down. It sounds wet, not dry.\n\nVet visit this week:\n- She heard a Grade 2 heart murmur (didn't know this before)\n- Did an X-ray — showed slight heart enlargement\n- Bloods were normal\n- She's referring us to a veterinary cardiologist\n\nThe cardiologist appointment is in 2 weeks. I'm anxious and trying not to google too much.\n\nHas anyone dealt with a heart murmur in a large breed dog? What was the outcome? Any tips for managing it until we see the specialist?\n\nDuke's my best mate, I just want the best for him. 🙏`,
        dog: MOCK_USERS[1].dogs[0], createdAt: '8 hours ago', likes: 29, comments: 34, views: 198, tags: ['Heart Disease', 'Heart Murmur', 'Question'],
        pinned: false, verified: false
    },
    {
        id: 'p4', userId: 'u4', category: 'tip',
        title: 'The $30 ramp that changed everything for Rocky — no more jumping',
        excerpt: 'Rocky is 12 and has bad hips. We spent $30 at Bunnings on a DIY ramp and it\'s been a life changer for him and for us...',
        content: `Want to share a super simple tip that cost us almost nothing:\n\nRocky (12-year-old Labrador, bad arthritis in both hips) was struggling to get onto the couch and into the car. He loves both — and was getting frustrated.\n\n**The solution:**\n$30 at Bunnings:\n- One piece of 1200x300mm plywood\n- Some non-slip rubber matting from the $2 shop\n- Four rubber feet\n\nTotal cost: about $32\n\nWe made two ramps — one for the couch, one for the boot of the ute (he's still strong enough to jump up but it was getting harder).\n\n**Tips if you make one:**\n- The angle should be no more than 30 degrees\n- Cover every inch with non-slip matting — wet paws are slippery\n- Secure it firmly so it doesn't shift\n\nRocky uses both ramps multiple times a day. He's so much happier and we don't have to lift him anymore.\n\nIf your senior dog struggles with jumping, please try this before expensive surgery or medication. Sometimes simple things work best. 🐾`,
        dog: MOCK_USERS[3].dogs[0], createdAt: '1 day ago', likes: 124, comments: 45, views: 892, tags: ['Arthritis', 'Home Tips', 'Mobility'],
        pinned: false, verified: false
    },
    {
        id: 'p5', userId: 'u5', category: 'health-case',
        title: 'Charlie\'s skin issues turned out to be kidney-related — a lesson in always trusting your gut',
        excerpt: 'Charlie started losing coat condition and developing dry, flaky skin. We tried everything topically. Turns out it was a kidney issue all along...',
        content: `This is a hard one to write but I want to share because it might help someone else.\n\nCharlie (Cavoodle, 8) started losing her beautiful coat about 6 months ago. It became dry, brittle, and she'd scratch constantly.\n\nWe saw two vets:\n- First vet: "Probably allergies, try this special shampoo and fish oil"\n- Second vet (after no improvement): "Could be thyroid, let's test"\n\nThyroid came back normal. Months went by. I kept saying "something isn't right" but felt like I was being overprotective.\n\nThird vet (referred to specialist):\nShe did a full senior blood panel — not just thyroid. Charlie's kidney values were elevated. Stage 2 CKD.\n\n**The skin was a SYMPTOM.**\nPoor coat condition is one of the classic signs of kidney disease in dogs. We had no idea.\n\nWe're now managing Charlie's kidney health with a renal diet and regular monitoring. The skin has already improved.\n\n**My takeaway:**\nIf something feels wrong and your vet isn't listening, get a second or third opinion. Request a full senior blood panel including kidney values. Don't let them dismiss it because your dog "seems fine."\n\nTrust your gut. You're the one who sees your dog every day. ❤️`,
        dog: MOCK_USERS[4].dogs[0], createdAt: '2 days ago', likes: 201, comments: 58, views: 1423, tags: ['Kidney Disease', 'Early Detection', 'Lesson Learned'],
        pinned: false, verified: false
    },
    {
        id: 'p6', userId: 'u7', category: 'product',
        title: 'Honest review: 5 orthopedic dog beds — which one is actually worth it',
        excerpt: 'After Coco (13) and Buddy (7) went through 6 beds in 3 years, I feel qualified to give a proper review. Here\'s what\'s good, what\'s overpriced, and what to avoid...',
        content: `I've spent way too much money on dog beds over the years. Here's my honest breakdown after testing with two very different dogs:\n\n**Test subjects:**\n- Coco: 13yo Poodle, 6kg, moderate arthritis, prefers to sleep on us\n- Buddy: 7yo Maltese, 4kg, healthy but dramatic\n\n**Tested beds:**\n\n1. **Big Barker 7" Orthopedic (~$250)** ⭐⭐⭐⭐⭐\n   - Expensive but genuinely the best. Coco's stiffness improved noticeably after switching. Worth every cent for dogs with joint issues.\n\n2. **K9 Orthopedic (~$130)** ⭐⭐⭐⭐\n   - Very good quality for the price. Memory foam is 4", good density. Recommended.\n\n3. **Kmart Memory Foam (~$45)** ⭐⭐⭐\n   - Surprisingly decent. Not as thick as the premium ones but for healthy senior dogs, totally fine.\n\n4. **IKEA Lurviken cover + Kmart insert (~$60)** ⭐⭐⭐\n   - DIY hack that actually works. Put a Kmart memory foam insert inside an IKEA dog cover. Half the price of branded beds.\n\n5. **Cooling gel beds (~$50)** ⭐\n   - Useless for older dogs with arthritis. They need warmth, not cooling.\n\n**What I avoid:** Anything with bean filling, cheap polyester fill, or beds under 10cm thick.\n\nHappy to answer questions about specific breeds or sizes! 🛏️`,
        dog: MOCK_USERS[6].dogs[0], createdAt: '3 days ago', likes: 89, comments: 67, views: 634, tags: ['Product Review', 'Beds', 'Arthritis'],
        pinned: false, verified: false
    },
    {
        id: 'p7', userId: 'u8', category: 'question',
        title: 'When did you start palliative care for your dog? How did you know it was time?',
        excerpt: 'Oscar is 9 and was diagnosed with a Grade 4 heart murmur. Vet says it\'s manageable but I want to prepare for what\'s ahead...',
        content: `I hope this doesn't come across as morbid — I just want to be prepared and do right by Oscar.\n\nOscar (9yo Frenchie) was diagnosed with a Grade 4 heart murmur last month. The cardiologist says his mitral valve is degenerating but hasn't progressed to heart failure yet. He's on Fortekor and a low-salt diet.\n\nHe's still enjoying life: walks (shorter now), eating well, happy to see us. But I can see small changes and I'm an anxious dog dad.\n\nFor those who've been through this:\n- At what stage did you start thinking about quality of life vs. quantity?\n- What signs told you it was time?\n- How do you make the final decision? I can't bear the thought of waiting too long.\n\nI know every dog is different. I just want to hear real experiences so I can be more prepared.\n\nOscar is my first dog as an adult and I love him more than I can express. Whatever comes, I just want him to not suffer.\n\nThank you to anyone who shares their story. 💙`,
        dog: MOCK_USERS[7].dogs[0], createdAt: '4 days ago', likes: 156, comments: 89, views: 1108, tags: ['Heart Disease', 'Quality of Life', 'Support'],
        pinned: false, verified: false
    },
    {
        id: 'p8', userId: 'u6', category: 'tip',
        title: 'Free symptom tracking spreadsheet — built this for Max and happy to share',
        excerpt: 'I\'m a data nerd and built a weekly symptom tracker in Google Sheets. It helped us spot patterns in Max\'s bad days and figure out triggers...',
        content: `Max (10yo Border Collie) has good days and bad days with his mobility. After months of not understanding why some weeks were worse than others, I built this tracker.\n\n**What it tracks (daily):\n- Walk distance and how he seemed after\n- Appetite (1-5 scale)\n- Supplements given\n- Energy level (1-5)\n- Any new symptoms\n- Sleep quality\n- Weather/temperature\n\n**What we discovered:**\n- Max is ALWAYS worse on cold, rainy days\n- Skipping his evening glucosamine = next day stiffness\n- He feels best on day 3 after his monthly Adequan injection\n\n**The spreadsheet:**\nI've shared a template here — just make a copy to your Google Drive and use it for free:\n[Template link would go here]\n\nI print a weekly version and keep it on the fridge. Our vet actually loves looking at it during checkups.\n\nIf your dog has good days and bad days, tracking patterns can genuinely help. It's not overthinking — it's being a great dog parent. 📊`,
        dog: MOCK_USERS[5].dogs[0], createdAt: '5 days ago', likes: 73, comments: 28, views: 445, tags: ['Arthritis', 'Tracking', 'Tips'],
        pinned: false, verified: false
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
