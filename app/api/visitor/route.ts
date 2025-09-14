import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const visitorDataFile = path.join(process.cwd(), 'visitor-data.json');

// Initialize visitor data if file doesn't exist
if (!fs.existsSync(visitorDataFile)) {
  fs.writeFileSync(visitorDataFile, JSON.stringify({
    totalUniqueVisitors: 0,
    dailyVisitors: {},
    deviceFingerprints: {},
    lastReset: new Date().toISOString().split('T')[0] // YYYY-MM-DD format
  }));
}

// Generate device fingerprint from request headers
function generateDeviceFingerprint(request: NextRequest): string {
  const headers = request.headers;
  const fingerprintData = [
    headers.get('user-agent') || '',
    headers.get('accept-language') || '',
    headers.get('accept-encoding') || '',
    headers.get('sec-ch-ua') || '',
    headers.get('sec-ch-ua-mobile') || '',
    headers.get('sec-ch-ua-platform') || '',
    request.ip || 'unknown'
  ].join('|');

  return crypto.createHash('sha256').update(fingerprintData).digest('hex');
}

// Check if we need to reset daily counters
function shouldResetDailyCounters(lastReset: string): boolean {
  const today = new Date().toISOString().split('T')[0];
  return lastReset !== today;
}

// Reset daily counters
function resetDailyCounters(data: any): any {
  const today = new Date().toISOString().split('T')[0];
  data.dailyVisitors = {};
  data.lastReset = today;
  return data;
}

export async function GET() {
  try {
    const data = JSON.parse(fs.readFileSync(visitorDataFile, 'utf8'));

    // Reset daily counters if needed
    if (shouldResetDailyCounters(data.lastReset)) {
      const updatedData = resetDailyCounters(data);
      fs.writeFileSync(visitorDataFile, JSON.stringify(updatedData));
      return NextResponse.json({
        totalUniqueVisitors: updatedData.totalUniqueVisitors,
        todayVisitors: 0
      });
    }

    const today = new Date().toISOString().split('T')[0];
    const todayVisitors = data.dailyVisitors[today] || 0;

    return NextResponse.json({
      totalUniqueVisitors: data.totalUniqueVisitors,
      todayVisitors
    });
  } catch (error) {
    return NextResponse.json({
      totalUniqueVisitors: 0,
      todayVisitors: 0
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = JSON.parse(fs.readFileSync(visitorDataFile, 'utf8'));
    const deviceFingerprint = generateDeviceFingerprint(request);
    const today = new Date().toISOString().split('T')[0];

    // Reset daily counters if needed
    let updatedData = data;
    if (shouldResetDailyCounters(data.lastReset)) {
      updatedData = resetDailyCounters(data);
    }

    // Check if this device has visited today
    const hasVisitedToday = updatedData.dailyVisitors[today] &&
                           updatedData.dailyVisitors[today].includes(deviceFingerprint);

    if (!hasVisitedToday) {
      // New unique visitor for today
      if (!updatedData.dailyVisitors[today]) {
        updatedData.dailyVisitors[today] = [];
      }
      updatedData.dailyVisitors[today].push(deviceFingerprint);

      // Check if this is a completely new device ever
      if (!updatedData.deviceFingerprints[deviceFingerprint]) {
        updatedData.deviceFingerprints[deviceFingerprint] = {
          firstVisit: new Date().toISOString(),
          visitCount: 0
        };
        updatedData.totalUniqueVisitors += 1;
      }

      // Update visit count for this device
      updatedData.deviceFingerprints[deviceFingerprint].visitCount += 1;
      updatedData.deviceFingerprints[deviceFingerprint].lastVisit = new Date().toISOString();

      // Save updated data
      fs.writeFileSync(visitorDataFile, JSON.stringify(updatedData));
    }

    return NextResponse.json({
      totalUniqueVisitors: updatedData.totalUniqueVisitors,
      todayVisitors: updatedData.dailyVisitors[today].length,
      isNewVisitor: !hasVisitedToday
    });
  } catch (error) {
    return NextResponse.json({
      totalUniqueVisitors: 0,
      todayVisitors: 0,
      isNewVisitor: false
    }, { status: 500 });
  }
}
