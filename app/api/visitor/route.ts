import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const counterFile = path.join(process.cwd(), 'visitor-count.json');

// Initialize counter if file doesn't exist
if (!fs.existsSync(counterFile)) {
  fs.writeFileSync(counterFile, JSON.stringify({ count: 0 }));
}

export async function GET() {
  try {
    const data = fs.readFileSync(counterFile, 'utf8');
    const { count } = JSON.parse(data);
    return NextResponse.json({ count });
  } catch (error) {
    return NextResponse.json({ count: 0 }, { status: 500 });
  }
}

export async function POST() {
  try {
    const data = fs.readFileSync(counterFile, 'utf8');
    const counter = JSON.parse(data);
    counter.count += 1;
    fs.writeFileSync(counterFile, JSON.stringify(counter));
    return NextResponse.json({ count: counter.count });
  } catch (error) {
    return NextResponse.json({ count: 0 }, { status: 500 });
  }
}
