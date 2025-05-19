# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in VisionBoard AI, please disclose it responsibly.

- Email: security@yourdomain.dev
- Subject: **[SECURITY] VisionBoard AI Vulnerability Report**
- Include: Steps to reproduce, screenshots (if any), and suggestions

We'll acknowledge and investigate all legitimate reports within 48 hours.

## Supported Versions

| Version       | Supported |
|---------------|-----------|
| `v1.x.x`      | ✅ Yes     |
| `<= v0.9.x`   | ❌ No      |

## Scope

This applies to:
- The VisionBoard AI web app
- Supabase database rules and auth logic
- OpenAI API token handling
- Google Calendar OAuth and token refresh flows

## Commit to Transparency

All confirmed vulnerabilities will be published via GitHub Advisories.

## Security Measures

### Data Protection
- All data is encrypted at rest using AES-256
- HTTPS/TLS for all communications
- Regular security audits
- Automatic session timeouts

### Authentication
- OAuth 2.0 implementation
- 2FA support
- Rate limiting on login attempts
- Secure password requirements

### Infrastructure
- Regular dependency updates
- Automated vulnerability scanning
- Docker container security
- Cloud provider security best practices

## Responsible Disclosure

We commit to:
1. Respond within 24 hours
2. Fix critical issues within 72 hours
3. Keep you updated on progress
4. Credit you in our security acknowledgments (if desired)

## Security Features

- End-to-end encryption for sensitive data
- Regular automated backups
- Audit logging
- IP whitelisting options
- GDPR compliance tools

## Best Practices

1. Keep your account credentials secure
2. Enable 2FA
3. Review access logs regularly
4. Report suspicious activity
5. Keep your client updated

## Contact

- Security: security@visionboard.ai
- Support: support@visionboard.ai
- Emergency: +1 (555) 123-4567 