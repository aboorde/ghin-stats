# Batched Import Performance Comparison

## Overview
The batched import service significantly reduces the number of network requests to Supabase by grouping operations together.

## Network Request Comparison

### Original Implementation (importService.js)
For 84 rounds with ~18 holes each:
- **Rounds**: 84 individual upsert requests
- **Hole Details**: ~84 requests (batched per round, 20 holes at a time)
- **Statistics**: 84 individual upsert requests
- **Total**: ~252 network requests

### Batched Implementation (importServiceBatched.js)
For the same 84 rounds:
- **Rounds**: 2 batch requests (50 rounds per batch)
- **Hole Details**: 3 batch requests (500 holes per batch, ~1512 total holes)
- **Statistics**: 2 batch requests (50 stats per batch)
- **Total**: 7 network requests

## Performance Improvement
- **Network requests reduced by 97%** (from ~252 to 7)
- **Faster import times** due to reduced network overhead
- **Better error handling** with batch-level error reporting
- **Parallel processing** of hole details and statistics

## Batch Sizes
```javascript
const BATCH_SIZE = {
  ROUNDS: 50,      // Upsert 50 rounds at once
  HOLES: 500,      // Upsert 500 hole details at once
  STATS: 50        // Upsert 50 statistics at once
}
```

These sizes are optimized to:
- Stay well below Supabase's request size limits
- Minimize the number of requests
- Provide reasonable error granularity

## Error Handling
- Duplicate key errors (23505) are handled gracefully
- Batch-level error reporting helps identify issues
- Import continues even if individual batches fail

## Usage
Simply import from the batched service instead:
```javascript
import { importGolfRoundsBatched } from '../services/importServiceBatched'
```

The API is identical to the original service, making it a drop-in replacement.