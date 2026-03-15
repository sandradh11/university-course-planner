import { Test } from '@nestjs/testing';
import { StudentsService } from './students.service';
import { SqliteService } from '../../db/sqlite.service';
import { SemesterService } from '../shared/semester.service';

describe('StudentsService', () => {
  let service: StudentsService;

  const mockDb = {
    get: jest.fn(),
    all: jest.fn(),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        StudentsService,
        {
          provide: SqliteService,
          useValue: mockDb,
        },
        {
          provide: SemesterService,
          useValue: {
            getActiveSemesterId: jest.fn().mockResolvedValue(1),
          },
        },
      ],
    }).compile();

    service = moduleRef.get(StudentsService);
    jest.clearAllMocks();
  });

  it('returns dashboard metrics for an existing student', async () => {
    mockDb.get
      .mockResolvedValueOnce({
        id: 381,
        first_name: 'Joshua',
        last_name: 'Lee',
        grade_level: '12',
      })
      .mockResolvedValueOnce({ earned_credits: 18.5 })
      .mockResolvedValueOnce({ attempted: 21 });

    const result = await service.getDashboard(381);

    expect(result.student.first_name).toBe('Joshua');
    expect(result.earnedCredits).toBe(18.5);
    expect(result.remainingCredits).toBe(11.5);
    expect(result.graduationProgressPercent).toBe(61.67);
    expect(result.gpa).toBe(3.52);
  });
});
