import os

files = [
    'src/app/hotels/page.tsx',
    'src/app/itinerary-builder/page.tsx',
    'src/app/rentals/page.tsx',
    'src/app/transport/page.tsx',
    'src/app/vendors/page.tsx'
]

for f in files:
    if not os.path.exists(f): continue
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    # Replace sr-only on date inputs
    content = content.replace('className="sr-only"\\n                        onChange', 'className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"\\n                        onChange')
    content = content.replace('className="sr-only"\\n                          onChange', 'className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"\\n                          onChange')
    content = content.replace('className="sr-only"', 'className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"')
    
    # Make sure labels have relative class
    content = content.replace('hover:underline cursor-pointer flex items-center gap-0.5">', 'hover:underline cursor-pointer flex items-center gap-0.5 relative">')
    content = content.replace('flex items-center gap-0.5 text-xs text-sky-600 font-bold cursor-pointer">', 'flex items-center gap-0.5 text-xs text-sky-600 font-bold cursor-pointer relative">')
    
    with open(f, 'w', encoding='utf-8') as file:
        file.write(content)
