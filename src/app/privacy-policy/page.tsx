import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'

export const metadata = {
  title: 'Privacy Policy | NextStep'
}

export default function PrivacyPolicyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      
      <main className="mx-auto w-full max-w-4xl px-6 py-20 flex-1">
        <div className="rounded-2xl border border-border/60 bg-card p-8 md:p-12 shadow-soft">
          <h1 className="text-3xl font-bold text-foreground mb-8" style={{ fontFamily: 'var(--font-sans)' }}>
            Privacy Policy
          </h1>
          
          <div className="space-y-6 text-sm md:text-base text-muted-foreground leading-relaxed">
            <p>Last updated: March 2026</p>
            
            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground mt-8">1. Information We Collect</h2>
              <p>NextStep ("we", "our", or "us") collects personal information when you register on our platform, book a counselling session, or schedule a college visit. This includes your name, email address, phone number, academic history, and target courses.</p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground mt-8">2. How We Use Your Information</h2>
              <p>We use the information we collect to:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Provide personalized college recommendations and admission guidance.</li>
                <li>Facilitate college campus visits and share your visiting schedule with the respective institutions.</li>
                <li>Schedule and manage your counselling sessions with our experts.</li>
                <li>Communicate with you regarding updates, new colleges, and platform changes.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground mt-8">3. Information Sharing</h2>
              <p>We do not sell your personal data. We only share necessary information with our partner colleges when you explicitly request a campus visit or express interest in their programs, strictly for the purpose of facilitating your admission journey.</p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground mt-8">4. Data Security</h2>
              <p>We implement industry-standard security measures including strict Database Row-Level Security (RLS) to protect your personal data from unauthorized access, alteration, or disclosure.</p>
            </section>

            <section className="space-y-3">
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">We use cookies to enhance your experience. By using &quot;NextStep&quot;, you consent to our use of cookies according to this Privacy Policy.</p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground mt-8">5. Contact Us</h2>
              <p>If you have any questions about this Privacy Policy, please contact us at hello.yournextstep@gmail.com.</p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
