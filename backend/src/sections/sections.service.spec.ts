import { Test } from '@nestjs/testing';
import { SectionsService } from './sections.service';
import { SqliteService } from '../../db/sqlite.service';
import { SemesterService } from '../shared/semester.service';

describe('SectionsService', () => {
  let service: SectionsService;

  const mockDb = {
    get: jest.fn(),
    all: jest.fn(),
  };

  beforeEach(async () => {
    // Not using App module here deliberately to avoid bringing in other dependencies like courses and enrollments which are not relevant to this test suite as it is a small unit test
    const moduleRef = await Test.createTestingModule({
      providers: [
        SectionsService,
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

    service = moduleRef.get(SectionsService);
    jest.clearAllMocks();
  });

  it('groups rows by course and section with meeting times', async () => {
    mockDb.get.mockResolvedValue({ id: 7 });
    mockDb.all.mockResolvedValue([
      {
        section_id: 1,
        section_code: 'A',
        course_id: 16,
        course_code: 'CHEM101',
        course_name: 'Chemistry I',
        course_credits: 1,
        prerequisite_id: 11,
        day_of_week: 'MON',
        start_time: '09:00',
        end_time: '10:00',
      },
      {
        section_id: 1,
        section_code: 'A',
        course_id: 16,
        course_code: 'CHEM101',
        course_name: 'Chemistry I',
        course_credits: 1,
        prerequisite_id: 11,
        day_of_week: 'WED',
        start_time: '09:00',
        end_time: '10:00',
      },
    ]);

    const result = await service.listSections(undefined as never);

    expect(result).toHaveLength(1);
    expect(result[0].course.code).toBe('CHEM101');
    expect(result[0].courseSections).toHaveLength(1);
    expect(result[0].courseSections[0].meetingTimes).toHaveLength(2);
  });
});
