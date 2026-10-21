'use strict';

const steps = [
  {title:'AWS Cloud and EC2',short:'Cloud foundations',subtitle:'Create Ravi’s rented shop building',analogy:'Cloud city',eyebrow:'FOUNDATIONS',plain:'Ravi needs a place for his online shop. AWS is the cloud city, and EC2 is the rented shop building. The VPC is his network neighborhood, the public subnet is the street-facing area, and the Internet Gateway is the city’s main entrance.',technical:'Launch an EC2 instance using Amazon Linux 2023 in a public subnet. The subnet route table needs a route to an Internet Gateway (typically 0.0.0.0/0), and the instance needs a public IPv4 address for direct internet access.',commands:'AWS Console → EC2 → Launch instance\nAMI: Amazon Linux 2023\nNetwork: VPC + public subnet\nAuto-assign public IP: Enable',watch:'The cloud, VPC, public subnet, Internet Gateway, and EC2 building appear together.',note:'Keep the instance in a public subnet only when direct internet reachability is intended.'},
  {title:'Connect to EC2',short:'Secure administration',subtitle:'The owner gets a staff entrance',analogy:'Staff key',eyebrow:'CONNECT',plain:'Before arranging the shop, Ravi needs a safe way to enter the building. SSH or EC2 Instance Connect is his staff entrance. Only his own administrator connection should be allowed.',technical:'Connect with SSH using the matching private key, or use EC2 Instance Connect where supported and configured. The security group must permit TCP 22 from the administrator’s public IP, preferably as a /32 source—not from everyone.',commands:'ssh -i my-key.pem ec2-user@PUBLIC-IP\n# Or: EC2 Console → Connect → EC2 Instance Connect',watch:'An administrator connection approaches EC2; SSH is shown as a restricted path.',note:'Never share your private key. Avoid SSH source 0.0.0.0/0; use your current IP /32.'},
  {title:'Install Apache HTTPD',short:'Install the receptionist',subtitle:'Bring the website receptionist in',analogy:'Receptionist hired',eyebrow:'INSTALL',plain:'Ravi hires a receptionist to greet website visitors. Apache HTTPD is that receptionist: it waits for web requests and finds the right page to return.',technical:'Amazon Linux 2023 uses DNF to install the httpd package. Installation adds Apache’s server software and its default configuration and log locations; installation alone does not guarantee the service is running.',commands:'sudo dnf install httpd -y',watch:'A package box travels to the EC2 building and Apache appears as a new component.',note:'Run package-management commands from an administrator account with sudo access.'},
  {title:'Start and Enable Apache',short:'Start the service',subtitle:'Turn on the receptionist’s desk',analogy:'Power controls',eyebrow:'SERVICE CONTROL',plain:'Ravi switches on the reception desk. systemctl is the power-control panel: start runs Apache now, while enable makes it start automatically after a reboot.',technical:'The command enable --now enables the service at boot and starts it immediately. Check the unit status to confirm httpd is active. Apache normally listens on TCP port 80 for HTTP after the default service starts.',commands:'sudo systemctl enable --now httpd\nsudo systemctl status httpd',watch:'Apache lights up and its port 80 entrance becomes available inside the server.',note:'A running service is only one requirement; the network must also allow visitors to reach port 80.'},
  {title:'Create Website File',short:'Add the welcome page',subtitle:'Put Ravi’s welcome sign on the shelf',analogy:'Website storage shelf',eyebrow:'WEBSITE CONTENT',plain:'The receptionist needs a page to show. DocumentRoot is the website file shelf, usually /var/www/html/. The index.html file is Ravi’s welcome sign displayed when a visitor opens the site root.',technical:'Apache’s default document root on Amazon Linux is commonly /var/www/html. Create index.html there and ensure the web server can read it. The echo command below writes a simple HTML heading using tee with sudo.',commands:"echo '<h1>Welcome to Ravi Shop</h1>' | sudo tee /var/www/html/index.html",watch:'The HTML document moves onto the DocumentRoot shelf, ready for Apache to read.',note:'If you customize Apache configuration, confirm the active DocumentRoot and file permissions.'},
  {title:'Configure Security Group',short:'Set the door guard',subtitle:'Let customers in, keep admin access private',analogy:'Door guard',eyebrow:'NETWORK SECURITY',plain:'The Security Group is the door guard for Ravi’s building. It allows web visitors through HTTP port 80, but the SSH staff entrance on port 22 should be limited to Ravi’s administrator IP.',technical:'Add inbound HTTP / TCP / 80 from 0.0.0.0/0 when the website is intended to be public. Add SSH / TCP / 22 from your administrator public IPv4 address with /32. Security groups are stateful, so response traffic for allowed connections is automatically permitted.',commands:'Inbound rule 1: HTTP · TCP · 80 · 0.0.0.0/0\nInbound rule 2: SSH · TCP · 22 · YOUR-IP/32\nAWS Console → EC2 → Security Groups → Inbound rules',watch:'A lock filters the path: public HTTP passes, while unapproved SSH traffic is stopped.',note:'HTTP is unencrypted. For production, use HTTPS with a certificate and consider restricting administrative access further.'},
  {title:'Public IP and Browser',short:'Customer arrives',subtitle:'A visitor enters the shop address',analogy:'Shop address',eyebrow:'FIRST VISIT',plain:'Ravi puts the building’s public IPv4 address on his sign. A customer types http://PUBLIC-IP into a browser. The request travels through the internet, the Internet Gateway, the public subnet, and the Security Group before reaching EC2.',technical:'Use the instance’s actual public IPv4 address. The subnet route table must have a route to the Internet Gateway, the instance must be reachable, and the Security Group must allow inbound TCP 80. Replace PUBLIC-IP with the real address—do not type the placeholder literally.',commands:'http://PUBLIC-IP\n# Example format only: http://203.0.113.10\n# Use your own EC2 public IPv4 address',watch:'A gold envelope travels from the visitor, through the network entrance and guard, to EC2.',note:'The example IP uses a documentation-only address range. Use the actual public IPv4 shown in your EC2 console.'},
  {title:'Apache Serves the Website',short:'Request and response',subtitle:'The receptionist finds the welcome page',analogy:'Receptionist delivers page',eyebrow:'HTTP FLOW',plain:'The visitor asks for Ravi’s shop. Apache receives the HTTP request, reads index.html from the shelf, and sends the page back. The browser displays the welcome heading.',technical:'A successful request commonly returns HTTP/1.1 200 OK when the page is found and served. Apache maps the request path to content under DocumentRoot. The browser receives the response body and renders its HTML.',commands:'curl -i http://PUBLIC-IP\n# Look for: HTTP/1.1 200 OK\n# Then inspect the returned HTML',watch:'A document moves from the shelf to Apache, then a green check returns to the browser.',note:'A 200 response means the HTTP request succeeded; it does not by itself prove every page or application feature works.'},
  {title:'Monitoring and Troubleshooting',short:'Check the visitor register',subtitle:'Find out why a visitor was blocked',analogy:'Visitor + problem registers',eyebrow:'TROUBLESHOOT',plain:'Ravi checks the visitor register (access log) and problem register (error log). If a visitor is blocked, check Apache, the port listener, the page, the Security Group, the public IP, and the route table in a sensible order.',technical:'Start with service status and the local listener, then test localhost. If local HTTP works but public access fails, check the public IPv4, inbound TCP 80, subnet route to the Internet Gateway, and network ACLs if customized. Access logs record requests; error logs help diagnose server-side issues.',commands:"sudo systemctl status httpd\nsudo ss -tlnp | grep ':80'\ncurl http://localhost\nsudo journalctl -u httpd\nsudo tail -f /var/log/httpd/access_log\nsudo tail -f /var/log/httpd/error_log",watch:'A red cross marks a blocked attempt; a magnifying glass inspects the path, then a green request succeeds after the rule is corrected.',note:'If curl localhost works but the public browser fails, focus first on public networking and Security Group rules.'},
  {title:'Complete Architecture',short:'Everything connected',subtitle:'Ravi’s online shop is open',analogy:'Shop ready for customers',eyebrow:'END-TO-END FLOW',plain:'Ravi’s shop is open! A visitor sends a request; the network entrance and guard check the way; EC2 runs Apache; Apache reads the welcome page and sends a response back to the visitor.',technical:'End-to-end path: Visitor → Internet → Internet Gateway → Public Subnet → Security Group → EC2 → Apache HTTPD → index.html → HTTP Response → Visitor. For production, add a domain name, HTTPS/TLS certificate, monitoring, backups, and an appropriate architecture for availability and scaling.',commands:'Visitor → Internet → Internet Gateway → Public Subnet\n→ Security Group → EC2 → Apache HTTPD → index.html\n→ HTTP 200 response → Visitor\nOptional: domain name + HTTPS/TLS',watch:'All network and server components remain visible while request and response packets complete the full journey.',note:'Production improvement: use HTTPS and a domain name; consider a load balancer, managed DNS, patching, and monitoring.'}
];

const $ = (selector) => document.querySelector(selector);
const nav = $('#stepNav');
let currentStep = 0;
let autoTimer = null;
let previousVisible = new Set();
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

function buildNavigation() {
  nav.innerHTML = '';
  steps.forEach((step, index) => {
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'step-button';
    button.innerHTML = `<span class="step-number">${String(index + 1).padStart(2, '0')}</span><span><strong>${step.title}</strong><small>${step.subtitle}</small></span>`;
    button.addEventListener('click', () => showStep(index));
    nav.appendChild(button);
  });
}

function updateScene(index) {
  const visible = new Set();
  document.querySelectorAll('.scene-node[data-from]').forEach((node) => {
    const start = Number(node.dataset.from);
    const shouldShow = index + 1 >= start;
    node.classList.toggle('is-hidden', !shouldShow);
    node.classList.remove('is-new');
    if (shouldShow) {
      visible.add(node.id);
      if (!previousVisible.has(node.id) && !reducedMotion.matches) {
        void node.getBoundingClientRect();
        node.classList.add('is-new');
      }
    }
  });
  previousVisible = visible;
  $('#overlayNumber').textContent = `STEP ${String(index + 1).padStart(2, '0')}`;
  $('#overlayTitle').textContent = steps[index].analogy;
  $('#blockPacket').style.opacity = index >= 8 ? '1' : '0';
  $('#troublePacket').style.opacity = index >= 8 ? '1' : '0';
  $('#installPacket').style.opacity = index >= 2 ? '1' : '.18';
  $('#requestPacket').style.opacity = index >= 6 ? '1' : '.38';
  $('#responsePacket').style.opacity = index >= 7 ? '1' : '.28';
  $('#filePacket').style.opacity = index >= 4 ? '1' : '.2';
  document.querySelectorAll('.route').forEach((path) => path.classList.toggle('is-muted', index < 6));
  $('#serverHealth').setAttribute('width', index >= 3 ? '327' : '85');
  $('#watchDot').textContent = index === 8 ? '⌕' : index === 5 ? '▣' : index >= 6 ? '✉' : '●';
}

function showStep(index) {
  currentStep = Math.max(0, Math.min(steps.length - 1, index));
  const step = steps[currentStep];
  document.querySelectorAll('.step-button').forEach((button, i) => {
    if (i === currentStep) button.setAttribute('aria-current', 'step');
    else button.removeAttribute('aria-current');
  });
  $('#stepCount').textContent = `${String(currentStep + 1).padStart(2, '0')} / 10`;
  $('#progressLabel').textContent = `Step ${currentStep + 1} of 10`;
  $('#progressBar').style.width = `${(currentStep + 1) * 10}%`;
  $('#workspaceTitle').textContent = step.title;
  $('#lessonEyebrow').textContent = `STEP ${String(currentStep + 1).padStart(2, '0')} · ${step.eyebrow}`;
  $('#lessonTitle').textContent = step.title;
  $('#analogyPill').textContent = step.analogy;
  $('#plainText').textContent = step.plain;
  $('#technicalText').textContent = step.technical;
  $('#commandText').textContent = step.commands;
  $('#watchText').textContent = step.watch;
  $('#watchLabel').textContent = step.short;
  $('#safetyNote').textContent = step.note;
  $('#prevBtn').disabled = currentStep === 0;
  $('#nextBtn').disabled = currentStep === steps.length - 1;
  updateScene(currentStep);
  if (window.innerWidth < 780) {
    const active = nav.children[currentStep];
    if (active) active.scrollIntoView({ behavior: reducedMotion.matches ? 'auto' : 'smooth', block: 'nearest', inline: 'nearest' });
  }
}

function stopAutoPlay() {
  if (autoTimer !== null) window.clearInterval(autoTimer);
  autoTimer = null;
  $('#autoBtn').classList.remove('is-playing');
  $('#autoBtn').querySelector('.play-symbol').textContent = '▶';
  $('#autoBtnLabel').textContent = 'Auto-play';
  $('#autoBtn').setAttribute('aria-pressed', 'false');
}
function startAutoPlay() {
  if (autoTimer !== null) { stopAutoPlay(); return; }
  $('#autoBtn').classList.add('is-playing');
  $('#autoBtn').querySelector('.play-symbol').textContent = 'Ⅱ';
  $('#autoBtnLabel').textContent = 'Pause tour';
  $('#autoBtn').setAttribute('aria-pressed', 'true');
  autoTimer = window.setInterval(() => {
    // Keep the guided tour moving: after step 10, loop smoothly back to step 1.
    showStep(currentStep >= steps.length - 1 ? 0 : currentStep + 1);
  }, 5000);
}

$('#prevBtn').addEventListener('click', () => { stopAutoPlay(); showStep(currentStep - 1); });
$('#nextBtn').addEventListener('click', () => { stopAutoPlay(); showStep(currentStep + 1); });
$('#resetBtn').addEventListener('click', () => { stopAutoPlay(); previousVisible = new Set(); showStep(0); });
$('#autoBtn').addEventListener('click', startAutoPlay);
$('#themeToggle').addEventListener('click', () => {
  const enabled = document.body.classList.toggle('light-mode');
  $('#themeToggle').setAttribute('aria-pressed', String(enabled));
  $('#themeToggle').innerHTML = enabled ? '☾ <span>Dark mode</span>' : '☼ <span>Light mode</span>';
});
$('#copyBtn').addEventListener('click', async () => {
  const text = $('#commandText').textContent;
  const button = $('#copyBtn');
  try {
    await navigator.clipboard.writeText(text);
    button.textContent = '✓ Copied';
  } catch (error) {
    const range = document.createRange(); range.selectNodeContents($('#commandText'));
    const selection = window.getSelection(); selection.removeAllRanges(); selection.addRange(range);
    button.textContent = 'Select and copy';
  }
  window.setTimeout(() => { button.textContent = '▢ Copy commands'; }, 1800);
});
document.addEventListener('keydown', (event) => {
  if (event.altKey || event.ctrlKey || event.metaKey || /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) return;
  if (event.key === 'ArrowRight') { stopAutoPlay(); showStep(currentStep + 1); }
  if (event.key === 'ArrowLeft') { stopAutoPlay(); showStep(currentStep - 1); }
  if (event.code === 'Space' && !event.repeat) { event.preventDefault(); startAutoPlay(); }
});

buildNavigation();
showStep(0);
