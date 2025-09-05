// Landing page - static, stripped of all bloat
import { ArrowRight, Users, Target, Award, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Static landing page - no client components, no state, no loading
export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <Badge variant="secondary" className="mb-4">
            🚀 Transform Your Community
          </Badge>

          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
            Inspire Change Through
            <span className="text-orange-600 block">Community Challenges</span>
          </h1>

          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Join the Changemaker Platform and participate in meaningful
            challenges that drive positive impact in your community. Earn
            rewards, build connections, and make a difference.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/how-it-works">
              <Button 
                size="lg"
                className="bg-orange-600 hover:bg-orange-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
              >
                See How <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>

            <Link href="/auth/login">
              <Button
                variant="outline"
                size="lg"
                className="border-orange-500 text-orange-600 hover:bg-orange-50"
              >
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Why Choose Changemaker?
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Our platform empowers communities to create lasting positive change
            through structured challenges and meaningful engagement.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-white border-orange-200 hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="text-center">
              <Users className="h-12 w-12 text-orange-500 mx-auto mb-4" />
              <CardTitle className="text-gray-900">Community Driven</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Connect with like-minded individuals and organizations working
                toward common goals.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-white border-blue-200 hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="text-center">
              <Target className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              <CardTitle className="text-gray-900">
                Meaningful Challenges
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Participate in carefully designed challenges that create
                real-world impact.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-white border-emerald-200 hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="text-center">
              <Award className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
              <CardTitle className="text-gray-900">Earn Rewards</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Get recognized for your contributions with points, badges, and
                tangible rewards.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-white border-amber-200 hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="text-center">
              <TrendingUp className="h-12 w-12 text-amber-500 mx-auto mb-4" />
              <CardTitle className="text-gray-900">Track Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Monitor your impact and see how your efforts contribute to
                larger goals.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-orange-600 py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto text-white space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">
              Ready to Make a Difference?
            </h2>
            <p className="text-xl opacity-90">
              Join thousands of changemakers who are already creating positive
              impact in their communities.
            </p>
            <Link href="/how-it-works">
              <Button
                size="lg"
                variant="secondary"
                className="bg-white text-orange-600 hover:bg-gray-50 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                See How <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section - hardcoded */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-8">Our Impact</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <div className="text-3xl font-bold text-orange-600">500+</div>
              <div className="text-gray-600">Active Challenges</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-600">10K+</div>
              <div className="text-gray-600">Changemakers</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-600">50+</div>
              <div className="text-gray-600">Partner Organizations</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-600">100%</div>
              <div className="text-gray-600">Community Driven</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
