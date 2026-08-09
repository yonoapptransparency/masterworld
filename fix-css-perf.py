import re

with open('src/index.css', 'r') as f:
    content = f.read()

# Remove filter animation from logo aura
content = re.sub(r'animation: logo-aura-wave.*?;', '/* animation removed for perf */', content)

# Remove box-shadow animation from blowing button
content = re.sub(r'animation: button-blowing-glow.*?;', '/* animation removed for perf */', content)

# Remove arrow-glide animation
content = re.sub(r'animation: arrow-glide.*?;', '/* animation removed for perf */', content)

# Remove background-position animation from premium-action-btn
content = re.sub(r'animation: liquid-flow.*?;', '/* animation removed for perf */', content)

# Remove heart-beat from logo frame
content = re.sub(r'animation: logo-float-heartbeat.*?;', '/* animation removed for perf */', content)

# Remove shine overlay sweep
content = re.sub(r'animation: logo-sweep.*?;', '/* animation removed for perf */', content)

# Remove vibrating icon
content = re.sub(r'animation: gentle-vibration.*?;', '/* animation removed for perf */', content)

with open('src/index.css', 'w') as f:
    f.write(content)

