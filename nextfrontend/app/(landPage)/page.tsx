"use client"

import { useEffect, useRef } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { ArrowRightIcon, SparklesIcon, BoltIcon, ChartBarIcon, UserGroupIcon, ShieldCheckIcon, ClockIcon } from "@heroicons/react/24/outline"
import dynamic from "next/dynamic"

// Dynamically import heavy components
const AnimatedStats = dynamic(() => import("@/components/landing/AnimatedStats"), { ssr: false })
const InteractiveChart = dynamic(() => import("@/components/landing/InteractiveChart"), { ssr: false })
const TicketSimulator = dynamic(() => import("@/components/landing/TicketSimulator"), { ssr: false })
const GuitarString = dynamic(() => import("@/components/landing/GuitarString"), { ssr: false })

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

export default function LandingPage() {
  const navRef = useRef<HTMLElement>(null)

  useEffect(() => {

    // Navbar scroll effect
    const handleScroll = () => {
      if (navRef.current) {
        if (window.scrollY > 50) {
          navRef.current.classList.add("shadow-lg")
        } else {
          navRef.current.classList.remove("shadow-lg")
        }
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* <ParticleBackground /> */}
      {/* Navigation */}
      <nav ref={navRef} className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50 transition-shadow duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <SparklesIcon className="h-8 w-8 text-indigo-600" />
              <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Neuro Desk
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors">
                Login
              </Link>
              <Link href="/register" className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full mb-8 animate-fade-in-up">
            <SparklesIcon className="h-5 w-5" />
            <span className="text-sm font-semibold">AI-Powered IT Support</span>
          </div>

          {/* Heading */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight mb-6 animate-fade-in-up delay-100">
            <span className="block text-gray-900 mb-2">
              Intelligent Support Ticket
            </span>
            <span className="block text-indigo-600">
              Management System
            </span>
          </h1>

          {/* Description */}
          <p className="text-xl text-gray-600 leading-relaxed mb-10 max-w-3xl mx-auto animate-fade-in-up delay-200">
            Revolutionize your IT support with AI-driven ticket assignment, skill-based technician matching, 
            and real-time analytics. Get faster resolutions and happier users.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up delay-300">
            <Link 
              href="/register" 
              className="inline-flex items-center justify-center bg-indigo-600 text-white px-8 py-4 rounded-xl hover:bg-indigo-700 transition-colors font-semibold text-lg shadow-lg"
            >
              Start Free Trial
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </Link>
            <Link 
              href="#features" 
              className="inline-flex items-center justify-center bg-white text-indigo-600 px-8 py-4 rounded-xl hover:bg-gray-50 transition-colors border-2 border-indigo-600 font-semibold text-lg shadow-lg"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Interactive Demo Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <TicketSimulator />
      </section>

      {/* Features Grid */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-5xl font-extrabold text-gray-900 mb-4">Powerful Features</h2>
          <p className="text-xl text-gray-600">Everything you need for efficient IT support management</p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all border border-gray-100 hover-lift animate-fade-in-up delay-100">
            <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 w-14 h-14 rounded-xl flex items-center justify-center mb-4 shadow-lg">
              <BoltIcon className="h-7 w-7 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">AI-Powered Assignment</h3>
            <p className="text-gray-600">
              Intelligent ticket routing based on technician skills, availability, and workload. 
              Our AI analyzes ticket content and matches it with the best-suited technician.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all border border-gray-100 hover-lift animate-fade-in-up delay-200">
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 w-14 h-14 rounded-xl flex items-center justify-center mb-4 shadow-lg">
              <UserGroupIcon className="h-7 w-7 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Skill-Based Matching</h3>
            <p className="text-gray-600">
              Advanced skill profiling with junior, mid, senior, and expert levels. 
              Automatically match tickets to technicians with the right expertise.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all border border-gray-100 hover-lift animate-fade-in-up delay-300">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 w-14 h-14 rounded-xl flex items-center justify-center mb-4 shadow-lg">
              <ChartBarIcon className="h-7 w-7 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Real-Time Analytics</h3>
            <p className="text-gray-600">
              Comprehensive dashboards for admins, technicians, and users. 
              Track resolution trends, priority distribution, and performance metrics.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all border border-gray-100 hover-lift animate-fade-in-up delay-400">
            <div className="bg-gradient-to-br from-green-500 to-green-600 w-14 h-14 rounded-xl flex items-center justify-center mb-4 shadow-lg">
              <ClockIcon className="h-7 w-7 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Priority Management</h3>
            <p className="text-gray-600">
              Smart prioritization with critical, high, normal, and low levels. 
              Impact and urgency assessment for optimal ticket handling.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all border border-gray-100 hover-lift animate-fade-in-up delay-500">
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 w-14 h-14 rounded-xl flex items-center justify-center mb-4 shadow-lg">
              <ShieldCheckIcon className="h-7 w-7 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Role-Based Access</h3>
            <p className="text-gray-600">
              Secure, customized dashboards for admins, technicians, and users. 
              Each role gets the tools and information they need.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all border border-gray-100 hover-lift animate-fade-in-up delay-600">
            <div className="bg-gradient-to-br from-pink-500 to-pink-600 w-14 h-14 rounded-xl flex items-center justify-center mb-4 shadow-lg">
              <SparklesIcon className="h-7 w-7 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Audit Trail</h3>
            <p className="text-gray-600">
              Complete ticket history with automated audit trails. 
              Track every action, comment, and status change for full transparency.
            </p>
          </div>
        </div>
      </section>

      {/* Interactive Charts Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
        <InteractiveChart />
      </section>

      {/* Guitar String Interactive Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
        <GuitarString />
      </section>

      {/* Testimonials Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl font-extrabold text-gray-900 mb-4">Loved by Teams Worldwide</h2>
          <p className="text-xl text-gray-600">See what our customers have to say</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              name: "Sarah Johnson",
              role: "IT Director",
              company: "TechCorp",
              quote: "Neuro Desk reduced our ticket resolution time by 50%. The AI assignment is incredibly accurate!",
              rating: 5,
            },
            {
              name: "Michael Chen",
              role: "Support Manager",
              company: "CloudSystems",
              quote: "Best ticketing system we've used. The skill-based matching ensures tickets go to the right person every time.",
              rating: 5,
            },
            {
              name: "Emily Rodriguez",
              role: "CTO",
              company: "DataFlow Inc",
              quote: "The analytics dashboard gives us insights we never had before. Game changer for our support team!",
              rating: 5,
            },
          ].map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100"
            >
              <div className="flex mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <svg
                    key={i}
                    className="w-5 h-5 text-yellow-400 fill-current"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-700 mb-6 italic">"{testimonial.quote}"</p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {testimonial.name.charAt(0)}
                </div>
                <div className="ml-4">
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-600">
                    {testimonial.role} at {testimonial.company}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Integration Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl font-extrabold text-gray-900 mb-4">Seamless Integrations</h2>
          <p className="text-xl text-gray-600">Connect with your favorite tools</p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
          {["Slack", "Teams", "Jira", "GitHub", "Zendesk", "Salesforce"].map((tool, index) => (
            <motion.div
              key={tool}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 flex items-center justify-center"
            >
              <span className="text-lg font-bold text-gray-700">{tool}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl font-extrabold text-gray-900 mb-4">Frequently Asked Questions</h2>
          <p className="text-xl text-gray-600">Everything you need to know</p>
        </motion.div>

        <div className="space-y-6">
          {[
            {
              q: "How does the AI assignment work?",
              a: "Our AI analyzes ticket content, priority, and complexity, then matches it with technicians based on their skills, availability, and current workload for optimal assignment.",
            },
            {
              q: "Can I customize the skill levels?",
              a: "Yes! You can define custom skills and proficiency levels (junior, mid, senior, expert) for your team members.",
            },
            {
              q: "Is there a mobile app?",
              a: "Yes, Neuro Desk is fully responsive and works on all devices. Native mobile apps for iOS and Android are coming soon!",
            },
            {
              q: "How secure is my data?",
              a: "We use enterprise-grade encryption, regular security audits, and comply with SOC 2, GDPR, and HIPAA standards.",
            },
          ].map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-3">{faq.q}</h3>
              <p className="text-gray-600">{faq.a}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Stats Section with Animated Numbers */}
      <section className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 py-20 relative overflow-hidden z-10">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-extrabold text-white mb-4">Trusted by Teams Worldwide</h2>
            <p className="text-xl text-indigo-100">Real results from real companies</p>
          </motion.div>
          <AnimatedStats />
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl font-extrabold text-gray-900 mb-4">How It Works</h2>
          <p className="text-xl text-gray-600">Simple, efficient, and intelligent</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-12">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-center relative"
          >
            <motion.div
              whileHover={{ scale: 1.1, rotate: 360 }}
              transition={{ duration: 0.6 }}
              className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-bold mx-auto mb-6 shadow-2xl"
            >
              1
            </motion.div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Submit Ticket</h3>
            <p className="text-gray-600 text-lg">
              Users create tickets with detailed descriptions. Our system captures priority, impact, and urgency automatically.
            </p>
            <div className="hidden md:block absolute top-10 -right-6 w-12 h-1 bg-gradient-to-r from-indigo-300 to-purple-300"></div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-center relative"
          >
            <motion.div
              whileHover={{ scale: 1.1, rotate: 360 }}
              transition={{ duration: 0.6 }}
              className="bg-gradient-to-br from-purple-500 to-purple-600 text-white w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-bold mx-auto mb-6 shadow-2xl"
            >
              2
            </motion.div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">AI Assignment</h3>
            <p className="text-gray-600 text-lg">
              Our AI analyzes the ticket and matches it with the best technician based on skills, availability, and workload.
            </p>
            <div className="hidden md:block absolute top-10 -right-6 w-12 h-1 bg-gradient-to-r from-purple-300 to-blue-300"></div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <motion.div
              whileHover={{ scale: 1.1, rotate: 360 }}
              transition={{ duration: 0.6 }}
              className="bg-gradient-to-br from-blue-500 to-blue-600 text-white w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-bold mx-auto mb-6 shadow-2xl"
            >
              3
            </motion.div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Quick Resolution</h3>
            <p className="text-gray-600 text-lg">
              Technicians resolve issues efficiently with all the context they need. Users track progress in real-time.
            </p>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 py-24 overflow-hidden z-10">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10"
        >
          <h2 className="text-5xl md:text-6xl font-extrabold text-white mb-6">
            Ready to Transform Your IT Support?
          </h2>
          <p className="text-2xl text-indigo-100 mb-10">
            Join hundreds of companies using Neuro Desk to deliver exceptional support experiences.
          </p>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link href="/register" className="inline-flex items-center justify-center bg-white text-indigo-600 px-10 py-5 rounded-2xl hover:bg-gray-100 transition-all font-bold text-xl shadow-2xl">
              Get Started Free
              <ArrowRightIcon className="ml-3 h-6 w-6" />
            </Link>
          </motion.div>
          <p className="mt-6 text-indigo-200">No credit card required • 14-day free trial</p>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <SparklesIcon className="h-6 w-6 text-indigo-400" />
                <span className="text-xl font-bold text-white">Neuro Desk</span>
              </div>
              <p className="text-sm">
                AI-powered IT support ticket management for modern teams.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Security</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="hover:text-white transition-colors">About</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Careers</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="hover:text-white transition-colors">Documentation</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Status</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2025 Neuro Desk. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}