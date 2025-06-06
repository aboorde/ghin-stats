# Supabase Query Examples

## Read all rows

```javascript
let { data: hole_details, error } = await supabase
  .from('hole_details')
  .select('*')
```

## Read specific columns

```javascript
let { data: hole_details, error } = await supabase
  .from('hole_details')
  .select('some_column,other_column')
```

## Read referenced tables

```javascript
let { data: hole_details, error } = await supabase
  .from('hole_details')
  .select(`
    some_column,
    other_table (
      foreign_key
    )
  `)
```

## With pagination

```javascript
let { data: hole_details, error } = await supabase
  .from('hole_details')
  .select('*')
  .range(0, 9)
```

## Filtering

*Documentation: Supabase provides a wide range of filters*

### With filtering

```javascript
let { data: hole_details, error } = await supabase
  .from('hole_details')
  .select("*")

  // Filters
  .eq('column', 'Equal to')
  .gt('column', 'Greater than')
  .lt('column', 'Less than')
  .gte('column', 'Greater than or equal to')
  .lte('column', 'Less than or equal to')
  .like('column', '%CaseSensitive%')
  .ilike('column', '%CaseInsensitive%')
  .is('column', null)
  .in('column', ['Array', 'Values'])
  .neq('column', 'Not equal to')

  // Arrays
  .contains('array_column', ['array', 'contains'])
  .containedBy('array_column', ['contained', 'by'])

  // Logical operators
  .not('column', 'like', 'Negate filter')
  .or('some_column.eq.Some value, other_column.eq.Other value')
```

## Insert rows

*Documentation: insert lets you insert into your tables. You can also insert in bulk and do UPSERT.*

*insert will also return the replaced values for UPSERT.*

### Insert a row

```javascript
const { data, error } = await supabase
  .from('hole_details')
  .insert([
    { some_column: 'someValue', other_column: 'otherValue' },
  ])
  .select()
```

### Insert many rows

```javascript
const { data, error } = await supabase
  .from('hole_details')
  .insert([
    { some_column: 'someValue' },
    { some_column: 'otherValue' },
  ])
  .select()
```

### Upsert matching rows

```javascript
const { data, error } = await supabase
  .from('hole_details')
  .upsert({ some_column: 'someValue' })
  .select()
```

## Update rows

*Documentation: update lets you update rows. update will match all rows by default. You can update specific rows using horizontal filters, e.g. eq, lt, and is.*

*update will also return the replaced values for UPDATE.*

### Update matching rows

```javascript
const { data, error } = await supabase
  .from('hole_details')
  .update({ other_column: 'otherValue' })
  .eq('some_column', 'someValue')
  .select()
```

## Delete rows

*Documentation: delete lets you delete rows. delete will match all rows by default, so remember to specify your filters!*

### Delete matching rows

```javascript
const { error } = await supabase
  .from('hole_details')
  .delete()
  .eq('some_column', 'someValue')
```

## Subscribe to changes

*Supabase provides realtime functionality and broadcasts database changes to authorized users depending on Row Level Security (RLS) policies.*

### Subscribe to all events

```javascript
const channels = supabase.channel('custom-all-channel')
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'hole_details' },
    (payload) => {
      console.log('Change received!', payload)
    }
  )
  .subscribe()
```

### Subscribe to inserts

```javascript
const channels = supabase.channel('custom-insert-channel')
  .on(
    'postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'hole_details' },
    (payload) => {
      console.log('Change received!', payload)
    }
  )
  .subscribe()
```

### Subscribe to updates

```javascript
const channels = supabase.channel('custom-update-channel')
  .on(
    'postgres_changes',
    { event: 'UPDATE', schema: 'public', table: 'hole_details' },
    (payload) => {
      console.log('Change received!', payload)
    }
  )
  .subscribe()
```

### Subscribe to deletes

```javascript
const channels = supabase.channel('custom-delete-channel')
  .on(
    'postgres_changes',
    { event: 'DELETE', schema: 'public', table: 'hole_details' },
    (payload) => {
      console.log('Change received!', payload)
    }
  )
  .subscribe()
```

### Subscribe to specific rows

```javascript
const channels = supabase.channel('custom-filter-channel')
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'hole_details', filter: 'some_column=eq.some_value' },
    (payload) => {
      console.log('Change received!', payload)
    }
  )
  .subscribe()
```