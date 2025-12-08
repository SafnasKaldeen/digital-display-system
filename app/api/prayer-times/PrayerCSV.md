# Sample Prayer Times CSV Format

## CSV Template

Create a CSV file with the following columns:

```csv
label,month,day,fajr,sunrise,dhuhr,asr,maghrib,isha
Colombo 2025,1,1,05:30,06:45,12:15,15:30,18:15,19:30
Colombo 2025,1,2,05:30,06:45,12:16,15:31,18:16,19:31
Colombo 2025,1,3,05:31,06:46,12:16,15:31,18:16,19:31
Colombo 2025,1,4,05:31,06:46,12:17,15:32,18:17,19:32
Colombo 2025,1,5,05:31,06:46,12:17,15:32,18:17,19:32
```

## Column Descriptions

- **label**: Name/identifier for this prayer schedule (e.g., "Colombo 2025", "Masjid Al-Noor Schedule")
- **month**: Month number (1-12)
- **day**: Day of month (1-31)
- **fajr**: Fajr prayer time in HH:MM format (24-hour)
- **sunrise**: Sunrise time in HH:MM format (24-hour)
- **dhuhr**: Dhuhr prayer time in HH:MM format (24-hour)
- **asr**: Asr prayer time in HH:MM format (24-hour)
- **maghrib**: Maghrib prayer time in HH:MM format (24-hour)
- **isha**: Isha prayer time in HH:MM format (24-hour)

## Requirements

1. All schedules with the same label will be grouped together
2. Times must be in 24-hour format (HH:MM)
3. Month must be between 1-12
4. Day must be valid for the given month (1-31)
5. All columns are required
6. Multiple schedules can be maintained by using different labels

## Example: Full Year Schedule

You can create a complete yearly schedule by adding 365 rows (366 for leap years) with consecutive dates.

## Notes

- If you upload a CSV with a label that already exists, it will replace all existing entries with that label
- The system will automatically fetch today's prayer times from the selected schedule
- You can manually override any prayer time after selecting a schedule
