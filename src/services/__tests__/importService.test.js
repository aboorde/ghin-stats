// Mock the supabase module before importing
jest.mock('../../lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null })
    }))
  }
}))

import { validateRoundData, formatImportSummary } from '../importService'

describe('importService', () => {
  describe('validateRoundData', () => {
    it('should validate a complete round object', () => {
      const validRound = {
        id: 1042124430,
        order_number: 80,
        score_day_order: 0,
        gender: "M",
        status: "Validated",
        is_manual: false,
        number_of_holes: 18,
        number_of_played_holes: 18,
        golfer_id: 11384483,
        facility_name: "Pine Valley CC",
        adjusted_gross_score: 90,
        played_at: "2024-12-29",
        course_id: "14481",
        course_name: "Pine Valley CC",
        tee_name: "White Tees",
        tee_set_id: "475708",
        tee_set_side: "All18",
        differential: 17.9,
        unadjusted_differential: 17.9,
        score_type: "H",
        course_rating: 69.6,
        slope_rating: 129,
        score_type_display_full: "H",
        score_type_display_short: "H",
        edited: false,
        posted_at: "2024-12-29T15:57:13.234Z",
        used: true,
        revision: true,
        pcc: 0,
        adjustments: [],
        exceptional: false,
        is_recent: true,
        net_score_differential: -0.4
      }

      expect(() => validateRoundData(validRound)).not.toThrow()
    })

    it('should throw error for missing required field', () => {
      const invalidRound = {
        id: 1042124430,
        // missing other required fields
      }

      expect(() => validateRoundData(invalidRound)).toThrow('Missing required field: order_number')
    })

    it('should validate hole details when present', () => {
      const roundWithHoles = {
        // ... all required round fields ...
        id: 1042124430,
        order_number: 80,
        score_day_order: 0,
        gender: "M",
        status: "Validated",
        is_manual: false,
        number_of_holes: 18,
        number_of_played_holes: 18,
        golfer_id: 11384483,
        facility_name: "Pine Valley CC",
        adjusted_gross_score: 90,
        played_at: "2024-12-29",
        course_id: "14481",
        course_name: "Pine Valley CC",
        tee_name: "White Tees",
        tee_set_id: "475708",
        tee_set_side: "All18",
        differential: 17.9,
        unadjusted_differential: 17.9,
        score_type: "H",
        course_rating: 69.6,
        slope_rating: 129,
        score_type_display_full: "H",
        score_type_display_short: "H",
        edited: false,
        posted_at: "2024-12-29T15:57:13.234Z",
        used: true,
        revision: true,
        pcc: 0,
        adjustments: [],
        exceptional: false,
        is_recent: true,
        net_score_differential: -0.4,
        hole_details: [
          {
            id: 1725267243,
            adjusted_gross_score: 4,
            raw_score: 4,
            hole_number: 1,
            par: 4,
            stroke_allocation: 11,
            x_hole: false
          }
        ]
      }

      expect(() => validateRoundData(roundWithHoles)).not.toThrow()
    })
  })

  describe('formatImportSummary', () => {
    it('should format successful import summary', () => {
      const results = {
        successful: 10,
        failed: 0,
        skipped: 5,
        errors: []
      }

      const summary = formatImportSummary(results)
      
      expect(summary.type).toBe('success')
      expect(summary.message).toBe('Import completed: 10 new rounds imported, 5 already existed')
      expect(summary.details).toBeNull()
      expect(summary.summary.total).toBe(15)
    })

    it('should format import summary with errors', () => {
      const results = {
        successful: 8,
        failed: 2,
        skipped: 0,
        errors: [
          {
            roundId: 123,
            courseName: 'Pine Valley CC',
            playedAt: '2024-01-01',
            error: 'Database error'
          },
          {
            roundId: 456,
            courseName: 'Augusta National',
            playedAt: '2024-01-02',
            error: 'Invalid data'
          }
        ]
      }

      const summary = formatImportSummary(results)
      
      expect(summary.type).toBe('warning')
      expect(summary.message).toBe('Import completed: 8 new rounds imported, 2 failed')
      expect(summary.details).toContain('Pine Valley CC')
      expect(summary.details).toContain('Augusta National')
    })

    it('should truncate error details when many errors', () => {
      const results = {
        successful: 5,
        failed: 5,
        skipped: 0,
        errors: Array(5).fill(null).map((_, i) => ({
          roundId: i,
          courseName: `Course ${i}`,
          playedAt: '2024-01-01',
          error: 'Error message'
        }))
      }

      const summary = formatImportSummary(results)
      
      expect(summary.details).toContain('and 2 more errors')
    })
  })
})