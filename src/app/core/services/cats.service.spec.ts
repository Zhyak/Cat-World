import { TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

import { CatsService } from './cats.service';
import { AuthService } from './auth.service';
import { supabase } from '../../supabase/supabase.client';

describe('CatsService', () => {
  let service: CatsService;
  let userSubject: BehaviorSubject<any>;

  beforeEach(() => {
    userSubject = new BehaviorSubject<any>(null);

    const authServiceMock = {
      user$: userSubject.asObservable(),
      getCurrentUserId: () => userSubject.value?.id || null
    } as AuthService;

    const snackBarMock = {
      open: jasmine.createSpy('open')
    } as unknown as MatSnackBar;

    const dbCat = {
      id: '1',
      name: 'Mittens',
      imageUrl: 'img',
      birthday: '2022-01-01',
      favoriteToy: 'ball',
      breed: 'Siamese',
      furColor: 'white',
      ownerName: 'John',
      description: 'A cat',
      personalityTraits: ['playful'],
      funFacts: ['likes naps'],
      user_id: '123',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: null
    };

    spyOn(supabase, 'from').and.returnValue({
      select: () => ({
        eq: () => ({
          order: () => Promise.resolve({ data: [dbCat], error: null })
        })
      })
    } as any);

    TestBed.configureTestingModule({
      providers: [
        CatsService,
        { provide: AuthService, useValue: authServiceMock },
        { provide: MatSnackBar, useValue: snackBarMock }
      ]
    });

    service = TestBed.inject(CatsService);
  });

  it('should load cats when user emits an id', async () => {
    userSubject.next({ id: '123' });

    await (service as any).loadCats();

    const cats = (service as any).cats.value;
    expect(cats.length).toBe(1);
    expect(cats[0].id).toBe('1');
    expect(cats[0].userId).toBe('123');
  });
});
