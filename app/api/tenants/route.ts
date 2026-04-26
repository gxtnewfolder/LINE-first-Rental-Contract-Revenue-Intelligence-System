// Tenants API - GET all, POST create
import { NextResponse } from 'next/server';
import { tenantService } from '@/services/tenant.service';
import { CreateTenantSchema } from '@/lib/validations/tenant.schema';

export async function GET() {
  try {
    const tenants = await tenantService.findAll();
    return NextResponse.json(tenants);
  } catch (error) {
    console.error('GET /api/tenants error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tenants' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = CreateTenantSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
    }
    const tenant = await tenantService.create(parsed.data);
    return NextResponse.json(tenant, { status: 201 });
  } catch (error) {
    console.error('POST /api/tenants error:', error);
    const message = error instanceof Error ? error.message : 'Failed to create tenant';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
