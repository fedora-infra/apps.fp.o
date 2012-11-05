%global prefix /srv/web

Name:           apps-fp-o
Version:        0.1
Release:        1%{?dist}
Summary:        A landing page for apps.fedoraproject.org

License:        MIT
URL:            http://github.com/ralphbean/apps.fp.o
# Use "./make-release.sh" from a git snapshot
# Please update the version number liberally.
Source0:        %{name}-%{version}.tar.gz

# Used for the yaml2{json,html}.py scripts.
Requires:       PyYAML

%description
This is static HTML, CSS, and javascript for a landing page for
http://apps.fedoraproject.org/packages.

Change the /usr/share/apps.fp.o/apps.yaml file and re-run
apps-fp-o-yaml2json.py and apps-fp-o-yaml2html.py to update the
diagram.

%prep
%setup -q

%build
# Nada

%install
mkdir -p %{buildroot}/%{_bindir}
install -m 0755 bin/yaml2html.py %{buildroot}/%{_bindir}/%{name}-yaml2html.py
install -m 0755 bin/yaml2json.py %{buildroot}/%{_bindir}/%{name}-yaml2json.py

mkdir -p %{buildroot}/%{_datadir}/%{name}
install -m 0644 data/* %{buildroot}/%{_datadir}/%{name}

mkdir -p %{buildroot}/%{prefix}/%{name}
cp -r {index.html,apps-yaml.html,bootstrap,css,img,js} %{buildroot}/%{prefix}/%{name}/.

%files
%doc README.rst LICENSE CONTRIBUTING.rst

%{_bindir}/%{name}-yaml2json.py
%{_bindir}/%{name}-yaml2html.py

%{_datadir}/%{name}/apps.yaml

# The rest of the content goes here
%{prefix}/%{name}/

%changelog
* Mon Nov 05 2012 Ralph Bean <rbean@redhat.com> - 0.1-1
- Initial packaging for Fedora Infrastructure
