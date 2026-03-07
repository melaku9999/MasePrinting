# Backend Connectivity Test

## Issue Identified
The error shows a malformed URL:
```
GET http://localhost:3000/apihttp:/localhost:8001/api/customers/list?page=1&page_size=20 404 (Not Found)
```

This indicates the URL construction is combining the Next.js API base URL with your backend URL incorrectly.

## Fix Applied
I've updated the `apiRequest` function to properly handle full URLs vs relative paths.

## Testing Steps

### 1. Verify Backend is Running
First, make sure your Django backend is running on port 8001:
```bash
# In your backend directory
python manage.py runserver 8001
```

### 2. Test Backend Directly
Open your browser and test these URLs directly:
- `http://localhost:8001/api/customers/list/?page=1&page_size=20`
- `http://localhost:8001/api/customers/2/` (if you have a customer with ID 2)

### 3. Check CORS Settings
Make sure your Django backend allows CORS requests from your frontend. In your Django settings, you should have:

```python
# settings.py
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",  # Your Next.js frontend
]

# Or for development:
CORS_ALLOW_ALL_ORIGINS = True
```

### 4. Check Django URLs
Verify your Django URLs are configured correctly:

```python
# urls.py
from django.urls import path, include

urlpatterns = [
    path('api/customers/', include('your_app.urls')),
    # ... other patterns
]
```

### 5. Test with Browser Developer Tools
1. Open your frontend at `http://localhost:3000`
2. Open Developer Tools (F12)
3. Go to the Network tab
4. Navigate to the Customers page
5. Check what URL is actually being requested

## Expected Behavior After Fix
- The URL should be: `http://localhost:8001/api/customers/list/?page=1&page_size=20`
- You should see detailed logging in the console showing the request and response
- The customer list should load from your backend

## If Still Not Working
1. Check if your backend is actually running on port 8001
2. Verify the exact URL structure your backend expects
3. Check for any CORS issues
4. Look at the browser's Network tab to see the actual request being made

The fix should resolve the URL construction issue. Let me know what you see in the console after refreshing the page!
