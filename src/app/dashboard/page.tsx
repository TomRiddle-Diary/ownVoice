"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";
import { PlusCircle } from "lucide-react";

export default function DashboardPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [showNewPost, setShowNewPost] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-gray-900">
            WriteCraft
          </Link>
          <Button variant="outline">Sign Out</Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Projects</h1>
            <p className="text-gray-600 mt-1">
              Create and manage your writing projects
            </p>
          </div>
          <Button onClick={() => setShowNewPost(true)}>
            <PlusCircle className="w-4 h-4 mr-2" />
            New Project
          </Button>
        </div>

        {showNewPost && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Create New Project</CardTitle>
              <CardDescription>
                Start a new writing project with the PREP method
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Project Title
                  </label>
                  <Input placeholder="e.g., Tech Blog Post" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Category
                  </label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="blog">Tech Blog</SelectItem>
                      <SelectItem value="proposal">Proposal</SelectItem>
                      <SelectItem value="self-pr">Self-PR</SelectItem>
                      <SelectItem value="essay">Essay</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button type="button">Create & Start</Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowNewPost(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>Sample Project</CardTitle>
              <CardDescription>Tech Blog • Created 2 days ago</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                A sample project to demonstrate the PREP method in action...
              </p>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/editor/sample">Open Project</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
