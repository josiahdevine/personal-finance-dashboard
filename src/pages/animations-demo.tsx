import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter,
  ExpandableCard
} from '../components/ui/card';
import { AnimatedCard } from '../components/ui/animated-card';
import { Button } from '../components/ui/button';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '../components/ui/tabs';
import { 
  Animated, 
  fadeIn, 
  slideUp, 
  slideInRight 
} from '../components/ui/animation';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Breadcrumb, BreadcrumbItem } from '../components/ui/breadcrumb';
import { ChevronRight, Globe, Home, RefreshCw, Settings, Stars } from 'lucide-react';

const AnimationDemo = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [currentTab, setCurrentTab] = useState('cards');
  
  // Toggle animation visibility for demonstration
  const toggleVisibility = () => {
    setIsVisible(false);
    setTimeout(() => setIsVisible(true), 500);
  };
  
  return (
    <DashboardLayout title="Animation System" subtitle="Explore the animation system and micro-interactions">
      <div className="mb-6">
        <Breadcrumb>
          <BreadcrumbItem href="/">
            <Home className="w-4 h-4 mr-1" />
            <span>Home</span>
          </BreadcrumbItem>
          <BreadcrumbItem href="/ui-components">
            <Settings className="w-4 h-4 mr-1" />
            <span>UI Components</span>
          </BreadcrumbItem>
          <BreadcrumbItem current>
            <Stars className="w-4 h-4 mr-1" />
            <span>Animation System</span>
          </BreadcrumbItem>
        </Breadcrumb>
      </div>
      
      <Tabs value={currentTab} onValueChange={setCurrentTab} className="mb-8">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="cards">Animated Cards</TabsTrigger>
          <TabsTrigger value="components">Component Animations</TabsTrigger>
          <TabsTrigger value="transitions">Micro-interactions</TabsTrigger>
        </TabsList>
        
        <div className="flex justify-end mb-4">
          <Button
            onClick={toggleVisibility}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Replay Animations
          </Button>
        </div>
        
        <TabsContent value="cards" className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="wait">
              {isVisible && (
                <AnimatedCard
                  animationVariant="fadeIn"
                  interactive
                  variant="default"
                  size="default"
                >
                  <CardHeader>
                    <CardTitle>Fade In Animation</CardTitle>
                    <CardDescription>Simple fade in effect</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>This card uses the fadeIn animation variant, which gently fades in the content.</p>
                  </CardContent>
                  <CardFooter>
                    <p className="text-sm text-muted-foreground">Delay: 0s - Default</p>
                  </CardFooter>
                </AnimatedCard>
              )}
            </AnimatePresence>
            
            <AnimatePresence mode="wait">
              {isVisible && (
                <AnimatedCard
                  animationVariant="scaleIn"
                  delay={0.2}
                  interactive
                  variant="outline"
                  size="default"
                >
                  <CardHeader>
                    <CardTitle>Scale In Animation</CardTitle>
                    <CardDescription>Scales and fades in</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>This card uses the scaleIn animation variant, which scales and fades in the content.</p>
                  </CardContent>
                  <CardFooter>
                    <p className="text-sm text-muted-foreground">Delay: 0.2s</p>
                  </CardFooter>
                </AnimatedCard>
              )}
            </AnimatePresence>
            
            <AnimatePresence mode="wait">
              {isVisible && (
                <AnimatedCard
                  animationVariant="slideUp"
                  delay={0.4}
                  interactive
                  variant="feature"
                  size="default"
                >
                  <CardHeader>
                    <CardTitle>Slide Up Animation</CardTitle>
                    <CardDescription>Slides up and fades in</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>This card uses the slideUp animation variant, which slides up and fades in the content.</p>
                  </CardContent>
                  <CardFooter>
                    <p className="text-sm text-muted-foreground">Delay: 0.4s</p>
                  </CardFooter>
                </AnimatedCard>
              )}
            </AnimatePresence>
          </div>
          
          <div className="mt-10">
            <h3 className="text-lg font-semibold mb-4">Expandable Card with Animations</h3>
            <AnimatePresence mode="wait">
              {isVisible && (
                <ExpandableCard
                  title="Expandable Animated Content"
                  description="Click the chevron to toggle content visibility"
                  defaultExpanded={false}
                  variant="default"
                >
                  <div className="space-y-4">
                    <p>This card demonstrates the animated expansion and collapse of content.</p>
                    <p>The content area smoothly animates its height when toggled, and the chevron rotates to indicate the current state.</p>
                  </div>
                </ExpandableCard>
              )}
            </AnimatePresence>
          </div>
        </TabsContent>
        
        <TabsContent value="components" className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Animated Components</CardTitle>
                <CardDescription>Using the Animated wrapper component</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <AnimatePresence mode="wait">
                  {isVisible && (
                    <Animated variants={fadeIn} className="p-4 bg-secondary rounded-lg">
                      <p className="text-center">Fade In Animation</p>
                    </Animated>
                  )}
                </AnimatePresence>
                
                <AnimatePresence mode="wait">
                  {isVisible && (
                    <Animated variants={slideUp} delay={0.2} className="p-4 bg-secondary rounded-lg">
                      <p className="text-center">Slide Up Animation</p>
                    </Animated>
                  )}
                </AnimatePresence>
                
                <AnimatePresence mode="wait">
                  {isVisible && (
                    <Animated variants={slideInRight} delay={0.4} className="p-4 bg-secondary rounded-lg">
                      <p className="text-center">Slide In From Right</p>
                    </Animated>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Interactive Elements</CardTitle>
                <CardDescription>Buttons with hover animations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <Button variant="default" className="group">
                    <Animated
                      as="span"
                      variants={fadeIn}
                      className="flex items-center gap-2"
                    >
                      <Globe className="w-4 h-4" />
                      <span>Standard Button</span>
                    </Animated>
                  </Button>
                  
                  <Button variant="outline" className="group">
                    <Animated
                      as="span"
                      variants={fadeIn}
                      className="flex items-center gap-2"
                    >
                      <Settings className="w-4 h-4" />
                      <span>Outline Button</span>
                    </Animated>
                  </Button>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">List with Staggered Animation</h4>
                  <AnimatePresence mode="wait">
                    {isVisible && (
                      <motion.ul className="space-y-2">
                        {[1, 2, 3, 4].map((item, index) => (
                          <motion.li
                            key={item}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 * index }}
                            className="flex items-center gap-2 p-2 bg-secondary/50 rounded"
                          >
                            <ChevronRight className="w-4 h-4 text-primary" />
                            <span>List item {item}</span>
                          </motion.li>
                        ))}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="transitions" className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Hover Effects</CardTitle>
                <CardDescription>Micro-interactions on hover</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-6 flex flex-col items-center gap-4">
                  <div className="relative p-4 border rounded-lg hover:shadow-lg transition-shadow hover:border-primary/50 cursor-pointer group">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 opacity-0 group-hover:opacity-100 rounded-lg transition-opacity" />
                    <p className="relative z-10">Hover me for gradient effect</p>
                  </div>
                  
                  <div className="p-4 border rounded-lg transition-all hover:scale-105 cursor-pointer">
                    <p>Scale on hover</p>
                  </div>
                  
                  <div className="relative p-4 border rounded-lg overflow-hidden cursor-pointer group">
                    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                    <p className="relative z-10">Gradient sweep effect</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Button Interactions</CardTitle>
                <CardDescription>Interactive button effects</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-6 flex flex-col items-center gap-4">
                  <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md transition-transform active:scale-95">
                    Click me (scale effect)
                  </button>
                  
                  <button className="relative px-4 py-2 bg-transparent border border-primary text-primary rounded-md overflow-hidden group">
                    <span className="relative z-10 group-hover:text-primary-foreground transition-colors duration-300">
                      Hover me (fill effect)
                    </span>
                    <span className="absolute inset-0 bg-primary w-full h-full transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
                  </button>
                  
                  <button className="px-4 py-2 border border-primary/50 rounded-md relative overflow-hidden group">
                    <span className="relative z-10">Ripple effect</span>
                    <span className="absolute w-0 h-0 rounded-full bg-primary/20 animate-ripple" />
                  </button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Focus States</CardTitle>
                <CardDescription>Accessible focus animations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-6 flex flex-col items-center gap-4">
                  <input 
                    type="text" 
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all" 
                    placeholder="Focus animation"
                  />
                  
                  <select className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all">
                    <option>Option 1</option>
                    <option>Option 2</option>
                    <option>Option 3</option>
                  </select>
                  
                  <button className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 transition-all">
                    Focus ring offset
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default AnimationDemo; 