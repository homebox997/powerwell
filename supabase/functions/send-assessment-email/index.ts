/**
 * PawWell — 体检提交邮件通知 Edge Function
 * ==============================================
 * 触发时机：当 assessments 表有新 INSERT 时自动调用
 * 依赖环境变量：RESEND_API_KEY（在 Supabase Dashboard → Edge Functions → Secrets 设置）
 * 
 * 测试命令：
 *   supabase functions serve send-assessment-email --env-file .env.local
 *   curl -X POST http://localhost:54321/functions/v1/send-assessment-email \
 *     -H "Content-Type: application/json" \
 *     -d '{"breed":"Golden Retriever","gender":"Male","nickname":"Max","symptoms":["Limping","Stiffness"],"detected_areas":["Joint & Mobility"],"symptom_count":2,"email":"test@example.com","country":"AU"}'
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
}

interface AssessmentRecord {
  id?: string
  breed: string
  gender: string
  nickname: string
  symptoms: string[]
  detected_areas: string[]
  symptom_count: number
  email: string | null
  country: string
  created_at?: string
}

// ===== 邮件内容生成 =====
function buildEmailHtml(record: AssessmentRecord): string {
  const { nickname, breed, gender, symptoms, detected_areas, symptom_count, email } = record
  
  // 症状标签颜色映射
  const areaStyles: Record<string, { bg: string; color: string; icon: string; desc: string }> = {
    'Joint & Mobility':    { bg: '#fff0eb', color: '#ff6b6b', icon: '🦴', desc: '关节和行动力问题' },
    'Kidney & Urinary':    { bg: '#e8f4f8', color: '#4a9eb8', icon: '🫘', desc: '肾脏和泌尿系统问题' },
    'Heart & Circulation': { bg: '#fce8e8', color: '#c0392b', icon: '❤️', desc: '心脏和循环系统问题' },
    'Skin & Coat':         { bg: '#fff9e6', color: '#d4a000', icon: '🐕', desc: '皮肤和毛发问题' },
    'Digestive':           { bg: '#e8f8e8', color: '#27ae60', icon: '🍖', desc: '消化系统问题' },
    'Neuro & Sensory':     { bg: '#f0ebff', color: '#7c3aed', icon: '🧠', desc: '神经和感官问题' },
  }

  // 生成症状列表 HTML
  const symptomsList = symptoms.length > 0
    ? `<ul style="margin:12px 0;padding-left:20px;">
        ${symptoms.map(s => `<li style="margin:6px 0;color:#444;">${s}</li>`).join('')}
       </ul>`
    : '<p style="color:#666;font-style:italic;">暂无明显症状</p>'

  // 生成关注领域 HTML
  const areasHtml = detected_areas.length > 0
    ? detected_areas.map(area => {
        const style = areaStyles[area] || { bg: '#f5f5f5', color: '#666', icon: '📋', desc: area }
        return `<span style="display:inline-block;background:${style.bg};color:${style.color};padding:6px 14px;border-radius:20px;font-size:14px;font-weight:600;margin:4px;">
          ${style.icon} ${style.desc}
        </span>`
      }).join('')
    : '<span style="color:#999;">无特定关注领域</span>'

  // 生成建议 HTML
  const recommendations = detected_areas.length === 0
    ? `<ul style="margin:12px 0;padding-left:20px;">
        <li style="margin:8px 0;">🐾 保持定期体检</li>
        <li style="margin:8px 0;">⚖️ 维持健康饮食和体重</li>
        <li style="margin:8px 0;">🚶 温和的日常运动</li>
       </ul>`
    : `<ul style="margin:12px 0;padding-left:20px;">
        <li style="margin:8px 0;">📅 尽快预约兽医</li>
        <li style="margin:8px 0;">📓 记录每日症状变化</li>
        <li style="margin:8px 0;">💧 监控饮水量和排尿情况</li>
        <li style="margin:8px 0;">🍽️ 注意食欲和精神状态变化</li>
       </ul>`

  // 紧迫度判断
  let urgencyLevel = '🟢 低'
  let urgencyColor = '#27ae60'
  let urgencyAdvice = '情况较为乐观，但仍建议定期检查。'
  if (symptom_count > 3) {
    urgencyLevel = '🟠 中高'
    urgencyColor = '#e67e22'
    urgencyAdvice = '多个身体系统受到影响，建议本周内就诊。'
  } else if (symptom_count > 0) {
    urgencyLevel = '🟡 中'
    urgencyColor = '#f39c12'
    urgencyAdvice = '有轻微症状，建议在1-2周内安排兽医检查。'
  }

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${nickname}'s Health Report | PawWell</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:'Segoe UI',Arial,sans-serif;">
  
  <!-- 外层包装 -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
          
          <!-- Logo 区 -->
          <tr>
            <td style="background:linear-gradient(135deg,#ff6b6b,#ff8e53);padding:24px 30px;text-align:center;border-radius:16px 16px 0 0;">
              <h1 style="margin:0;color:white;font-size:28px;font-weight:800;">🐾 PawWell</h1>
              <p style="margin:4px 0 0;color:rgba(255,255,255,0.9);font-size:14px;">AI-Powered Senior Dog Health Assessment</p>
            </td>
          </tr>
          
          <!-- 主内容区 -->
          <tr>
            <td style="background:white;padding:30px;">
              
              <!-- 标题 -->
              <h2 style="margin:0 0 4px;color:#2c3e50;font-size:22px;">Hi${email ? '' : ', pet parent'}!</h2>
              <p style="margin:0 0 24px;color:#7a8a9a;font-size:15px;">
                Here's the health assessment summary for <strong style="color:#ff6b6b;">${nickname}</strong> (${breed}, ${gender}).
              </p>
              
              <!-- 紧迫度 -->
              <div style="background:#f8f9fa;border-radius:12px;padding:16px 20px;margin-bottom:20px;">
                <div style="display:flex;align-items:center;gap:12px;">
                  <span style="font-size:28px;">⚡</span>
                  <div>
                    <div style="font-size:13px;color:#7a8a9a;margin-bottom:2px;">Assessment Result</div>
                    <div style="font-size:18px;font-weight:700;color:${urgencyColor};">${urgencyLevel} Priority</div>
                  </div>
                </div>
                <p style="margin:10px 0 0;color:#5a6c7d;font-size:14px;line-height:1.5;">${urgencyAdvice}</p>
              </div>
              
              <!-- 检测到的领域 -->
              <h3 style="margin:0 0 12px;font-size:15px;color:#2c3e50;text-transform:uppercase;letter-spacing:1px;">Areas of Concern</h3>
              <div style="margin-bottom:20px;">${areasHtml}</div>
              
              <!-- 症状列表 -->
              <h3 style="margin:0 0 12px;font-size:15px;color:#2c3e50;text-transform:uppercase;letter-spacing:1px;">Symptoms Reported (${symptom_count})</h3>
              ${symptomsList}
              
              <!-- 建议 -->
              <h3 style="margin:24px 0 12px;font-size:15px;color:#2c3e50;text-transform:uppercase;letter-spacing:1px;">Recommended Actions</h3>
              <div style="background:#fff0eb;border-radius:12px;padding:16px 20px;border-left:4px solid #ff6b6b;">
                ${recommendations}
              </div>
              
              <!-- 行动按钮 -->
              <div style="text-align:center;margin-top:28px;">
                <a href="https://agedpawwell.com/assessment" style="display:inline-block;background:linear-gradient(135deg,#ff6b6b,#ff8e53);color:white;padding:14px 32px;border-radius:50px;font-weight:700;font-size:16px;text-decoration:none;box-shadow:0 4px 15px rgba(255,107,107,0.3);">
                  🔄 Take Another Assessment
                </a>
              </div>
              
              <!-- 阅读推荐 -->
              ${detected_areas.length > 0 ? `
              <h3 style="margin:28px 0 12px;font-size:15px;color:#2c3e50;text-transform:uppercase;letter-spacing:1px;">Recommended Reading</h3>
              <div style="border:1px solid #eee;border-radius:12px;overflow:hidden;">
                ${detected_areas.map((area, i) => {
                  const slugMap: Record<string, string> = {
                    'Joint & Mobility': 'arthritis-in-senior-dogs',
                    'Kidney & Urinary': 'kidney-disease-screening',
                    'Heart & Circulation': 'heart-disease-senior-dogs',
                    'Skin & Coat': 'skin-problems-senior-dogs',
                    'Digestive': 'digestive-problems-senior-dogs',
                    'Neuro & Sensory': 'cognitive-decline-senior-dogs'
                  }
                  const slug = slugMap[area] || 'arthritis-in-senior-dogs'
                  return `
                <a href="https://agedpawwell.com/blog/${slug}" style="display:block;padding:12px 16px;border-bottom:1px solid #eee;text-decoration:none;color:#2c3e50;font-size:14px;" ${i === 0 ? '' : ''}>
                  📄 ${area} Guide for Senior Dogs →
                </a>`
                }).join('')}
              </div>
              ` : ''}
              
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background:#2c3e50;padding:20px 30px;border-radius:0 0 16px 16px;text-align:center;">
              <p style="margin:0 0 8px;color:rgba(255,255,255,0.7);font-size:13px;">
                This report is generated by AI and is for informational purposes only.<br>
                It does not replace professional veterinary advice.
              </p>
              <p style="margin:0;color:rgba(255,255,255,0.5);font-size:12px;">
                © 2026 PawWell · agedpawwell.com · Powered by AI
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}

function buildPlainText(record: AssessmentRecord): string {
  const { nickname, breed, gender, symptoms, detected_areas, symptom_count } = record
  return `
🐾 PawWell Health Assessment for ${nickname}

Breed: ${breed} | Gender: ${gender}
Symptoms reported: ${symptom_count}
Areas of concern: ${detected_areas.join(', ') || 'None'}

Symptoms: ${symptoms.join(', ') || 'None'}

---
This is an automated message from PawWell (agedpawwell.com).
Not a substitute for professional veterinary advice.
  `.trim()
}

// ===== 发送邮件 =====
async function sendEmail(to: string, record: AssessmentRecord): Promise<void> {
  const apiKey = Deno.env.get('RESEND_API_KEY')
  if (!apiKey) {
    throw new Error('RESEND_API_KEY environment variable is not set')
  }

  const subject = `🐾 ${record.nickname}'s Health Report from PawWell`
  const html = buildEmailHtml(record)
  const text = buildPlainText(record)

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: 'PawWell <noreply@agedpawwell.com>',
      to: [to],
      subject,
      html,
      text
    })
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Resend API error: ${res.status} - ${body}`)
  }
}

// ===== Supabase Trigger 入口 =====
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 支持两种调用方式：
    // 1. HTTP POST（手动测试）：body 包含完整 assessment 数据
    // 2. Database Trigger 调用：body 包含 { type: 'INSERT', table: 'assessments', record: {...} }

    let assessmentRecord: AssessmentRecord | null = null

    const body = await req.json().catch(() => ({}))

    // 方式1：数据库 Trigger 格式
    if (body.type === 'INSERT' && body.record) {
      assessmentRecord = body.record as AssessmentRecord
    }
    // 方式2：直接 POST 格式
    else if (body.breed) {
      assessmentRecord = body as AssessmentRecord
    }

    if (!assessmentRecord) {
      return new Response(
        JSON.stringify({ ok: false, error: 'No valid assessment record found in request body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 如果没有邮箱，记录但不发邮件
    if (!assessmentRecord.email) {
      console.log('[send-assessment-email] No email provided, skipping send:', JSON.stringify({
        breed: assessmentRecord.breed,
        nickname: assessmentRecord.nickname,
        symptom_count: assessmentRecord.symptom_count
      }))
      return new Response(
        JSON.stringify({ ok: true, skipped: true, reason: 'no_email' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 发送邮件
    console.log('[send-assessment-email] Sending email to:', assessmentRecord.email)
    await sendEmail(assessmentRecord.email, assessmentRecord)

    console.log('[send-assessment-email] Email sent successfully to:', assessmentRecord.email)

    return new Response(
      JSON.stringify({ ok: true, sent_to: assessmentRecord.email }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (err) {
    console.error('[send-assessment-email] Error:', err.message)
    
    // 如果是环境变量缺失，记录错误但不返回 500（避免触发 Supabase 重试）
    if (err.message.includes('RESEND_API_KEY')) {
      return new Response(
        JSON.stringify({ ok: false, error: err.message, fatal: true }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ ok: false, error: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
