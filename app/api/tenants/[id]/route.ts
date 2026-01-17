// Tenant by ID - GET, PATCH, DELETE
import { NextResponse } from 'next/server';
import { tenantService } from '@/services/tenant.service';

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const tenant = await tenantService.findById(id);
    
    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }
    
    return NextResponse.json(tenant);
  } catch (error) {
    console.error('GET /api/tenants/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tenant' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();
    const tenant = await tenantService.update(id, body);
    return NextResponse.json(tenant);
  } catch (error) {
    console.error('PATCH /api/tenants/[id] error:', error);
    const message = error instanceof Error ? error.message : 'Failed to update tenant';
    const status = message.includes('not found') ? 404 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    await tenantService.delete(id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('DELETE /api/tenants/[id] error:', error);
    const message = error instanceof Error ? error.message : 'Failed to delete tenant';
    const status = message.includes('not found') ? 404 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
