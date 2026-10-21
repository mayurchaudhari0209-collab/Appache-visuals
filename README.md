# Apache Server Visual

**An animated, beginner-friendly guide to hosting a website with Apache HTTP Server (HTTPD) on AWS EC2.** Follow Ravi, a shop owner, from creating a cloud server to serving a real HTML welcome page. Built with pure HTML, CSS, JavaScript, and one inline SVG diagram. No dependencies, framework, build step, or backend required.

Branding: **#Buildwithvinit**

## Features

- Ten numbered, interactive learning steps; selecting a step keeps earlier architecture components visible.
- One large inline SVG architecture map with animated HTTP request, HTML document, and HTTP response packets.
- Auto-play advances every five seconds, plus Reset, Previous, Next, keyboard navigation, and a light/dark theme toggle.
- Responsive layout, accessible focus styles, readable captions, copy-commands button, and reduced-motion support.
- Works locally and on GitHub Pages.

## The 10 steps

1. **AWS Cloud and EC2** — AWS is the cloud city; EC2 is the rented shop building. Introduces VPC, public subnet, Internet Gateway, and Amazon Linux 2023.
2. **Connect to EC2** — Admin access via SSH or EC2 Instance Connect. Restrict SSH to the administrator’s IP.
3. **Install Apache HTTPD** — Install the receptionist software: `sudo dnf install httpd -y`.
4. **Start and Enable Apache** — Start the service now and on reboot; check status: `sudo systemctl enable --now httpd` and `sudo systemctl status httpd`.
5. **Create Website File** — Put `index.html` in `/var/www/html/`, the default DocumentRoot on a typical Amazon Linux Apache setup.
6. **Configure Security Group** — Permit public HTTP TCP 80 for a public website; restrict SSH TCP 22 to the admin’s public IP `/32`.
7. **Public IP and Browser** — Open `http://PUBLIC-IP` using the instance’s actual public IPv4. The request travels through the Internet Gateway and public subnet.
8. **Apache Serves the Website** — Apache reads `index.html` and returns a successful HTTP response, commonly `HTTP 200 OK`.
9. **Monitoring and Troubleshooting** — Check service, listener, local HTTP, network rules, public IP, route table, and logs. See the commands below.
10. **Complete Architecture** — Visitor → Internet → Internet Gateway → Public Subnet → Security Group → EC2 → Apache HTTPD → `index.html` → HTTP Response → Visitor. HTTPS and a domain name are optional production improvements.

## Ravi’s real-life analogy

| AWS / web concept | Shop analogy |
| --- | --- |
| AWS | Cloud city |
| EC2 | Rented shop building |
| Amazon Linux | Shop operating system |
| Apache HTTPD | Receptionist |
| Public IPv4 | Shop address |
| Port 80 | Entrance for HTTP visitors |
| Security Group | Door guard / traffic filter |
| Internet Gateway | Main entrance to the network |
| DocumentRoot | Website file storage shelf |
| `index.html` | Shop welcome page |
| HTTP Request | Visitor asking for the website |
| HTTP Response | Receptionist delivering the website |
| `systemctl` | Power controls |
| Access logs | Visitor register |
| Error logs | Problem register |

## Commands used in the visual

### 1. Install Apache

```bash
sudo dnf install httpd -y
```

### 2. Start and enable Apache; verify status

```bash
sudo systemctl enable --now httpd
sudo systemctl status httpd
```

### 3. Create the welcome page

```bash
echo '<h1>Welcome to Ravi Shop</h1>' | sudo tee /var/www/html/index.html
```

### 4. Configure inbound rules in the AWS Console

- **HTTP:** TCP port `80`, source `0.0.0.0/0` for a website intended to be public.
- **SSH:** TCP port `22`, source your administrator public IP with `/32`.

Do not open SSH to the entire internet unless you have a specific, temporary reason and understand the risk. Security Groups are stateful virtual firewalls. Also verify that the subnet route table has a route to an Internet Gateway and that the EC2 instance has a public IPv4 address.

### 5. Test the site

```bash
curl -i http://localhost
curl -i http://PUBLIC-IP
```

Replace `PUBLIC-IP` with the actual public IPv4 address shown for your EC2 instance. `203.0.113.10` is an example-format address only and is not a real target to use.

### 6. Monitor and troubleshoot

```bash
sudo systemctl status httpd
sudo ss -tlnp | grep ':80'
curl http://localhost
sudo journalctl -u httpd
sudo tail -f /var/log/httpd/access_log
sudo tail -f /var/log/httpd/error_log
```

If `curl http://localhost` works but the public website does not, check the instance public IPv4, inbound TCP 80 rule, subnet route table and Internet Gateway attachment, and any customized network ACLs. Access logs record incoming requests; error logs help investigate server-side issues.

## Packet / moving-object legend

- **Envelope (gold):** HTTP request from the visitor.
- **Document (purple):** HTML file moving from website storage.
- **Green check:** successful HTTP response / HTTP 200 OK.
- **Package (gold):** Apache package installation.
- **Lock (blue):** Security Group filtering.
- **Red cross:** blocked connection.
- **Magnifying glass:** troubleshooting and tracing a failure.

## Run locally

No installation or build tools are needed.

1. Download or clone this project.
2. Open `index.html` directly in a modern browser, **or** start a simple local web server from the project folder:

   ```bash
   python -m http.server 8000
   ```

3. Visit `http://localhost:8000`.

The clipboard feature works best in a secure context (HTTPS or localhost); if browser clipboard permissions are unavailable, select the displayed commands and copy manually.

## Publish on GitHub Pages (three steps)

1. Create a GitHub repository named `apache-server-visual` and upload/push all project files, keeping `index.html` at the repository root.
2. Open **Settings → Pages**, select **Deploy from a branch**, choose `main` and `/(root)`, then click **Save**.
3. Wait for the Pages deployment to finish; open `https://YOUR-USERNAME.github.io/apache-server-visual/` (replace `YOUR-USERNAME` with your GitHub username).

## Project structure

```text
apache-server-visual/
├── index.html
├── css/
│   └── style.css
├── js/
│   └── app.js
├── .nojekyll
├── LICENSE
└── README.md
```

## Customization

- **Lesson text and commands:** edit the `steps` array in `js/app.js`.
- **Colors, spacing, breakpoints, and typography:** edit CSS variables and rules in `css/style.css`.
- **Diagram:** edit the inline SVG in `index.html`; preserve `viewBox="0 0 1100 620"` for the intended layout. Motion paths are SVG paths referenced by `<animateMotion><mpath href="#pathRequest" /></animateMotion>`.
- **Branding:** search for `#Buildwithvinit` in `index.html` and `README.md`.
- **Animation accessibility:** the CSS respects `prefers-reduced-motion`; keep important information available without animation when customizing.

## Technical notes

- Pure HTML, CSS, and JavaScript; no npm packages, frameworks, or build step.
- The Bricolage Grotesque font is loaded from Google Fonts with system fallbacks; if offline, a system font is used.
- The diagram is illustrative. It does not connect to or inspect an actual AWS account.
- HTTP on port 80 is unencrypted. For production, configure a domain and HTTPS/TLS certificate, keep the system patched, and consider high availability and monitoring.

## License

MIT License. See [`LICENSE`](LICENSE).
