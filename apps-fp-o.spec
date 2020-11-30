%global prefix /srv/web

Name:           apps-fp-o
Version:        3.3
Release:        1%{?dist}
Summary:        A landing page for apps.fedoraproject.org

License:        MIT
URL:            http://github.com/fedora-infra/apps.fp.o
# Use "./make-release.sh" from a git snapshot
# Please update the version number liberally.
Source0:        %{name}-%{version}.tar.gz

BuildArch:      noarch

# Needed for getting httpd's gid
BuildRequires:  httpd

# Used for the yaml2{json,html}.py scripts.
Requires:       python3-pyyaml

%description
This is static HTML, CSS, and javascript for a landing page for
http://apps.fedoraproject.org/

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
cp -r {index.html,apps-yaml.html,bootstrap,bootstrap-3.1.1-fedora,css,img,js} %{buildroot}/%{prefix}/%{name}/.

%files
%doc README.rst LICENSE CONTRIBUTING.rst

%{_bindir}/%{name}-yaml2json.py
%{_bindir}/%{name}-yaml2html.py

%{_datadir}/%{name}/apps.yaml

# The rest of the content goes here
%{prefix}/%{name}/
%attr(755, httpd, httpd) %dir %{prefix}/%{name}/

%changelog
* Mon Nov 30 2020 Pierre-Yves Chibon <pingou@pingoured.fr> - 3.3-1
- Update to 3.3
- Fix the link to dist-git/src.fp.o

* Fri Oct 30 2020 Pierre-Yves Chibon <pingou@pingoured.fr> - 3.2-1
- Update to 3.2
- Make the shebang of the scripts be python3

* Fri Oct 30 2020 Pierre-Yves Chibon <pingou@pingoured.fr> - 3.1-1
- Update to 3.1
- Make the script python3 compatible
- Adjust the dependency to python3-pyyaml

* Fri Oct 30 2020 Pierre-Yves Chibon <pingou@pingoured.fr> - 3.0-1
- Update to 3.0 with a number of changes, in the UI a little and more
  importantly in the data

* Thu Apr 23 2015 Ralph Bean <rbean@redhat.com> - 2.0-1
- Add packager and user template strings for make glorious fedmenu future.

* Sat Feb 21 2015 Ralph Bean <rbean@redhat.com> - 1.2-1
- Make the graph bigger.
- Change JSON structure w.r.t. icons.

* Thu Sep 25 2014 Ralph Bean <rbean@redhat.com> - 1.1-1
- Always use jsonp when querying status.fp.o.

* Thu Sep 25 2014 Ralph Bean <rbean@redhat.com> - 1.0-2
- Copy in the bootstrap fedora content.

* Thu Sep 25 2014 Ralph Bean <rbean@redhat.com> - 1.0-1
- Reorganized.
- Use modern bootstrap-fedora (3.1)
- Integrate with status.fp.o.

* Thu Mar 27 2014 Ralph Bean <rbean@redhat.com> - 0.5-1
- Deep-linking
- Use comfortaa

* Wed Oct 02 2013 Ricky Elrod <codeblock@fedoraproject.org> - 0.4-1
- Added Nuancier link.

* Fri Dec 14 2012 Ralph Bean <rbean@redhat.com> - 0.3-1
- Increased font and line sizes.

* Mon Nov 05 2012 Ralph Bean <rbean@redhat.com> - 0.2-2
- Make sure apache owns the static files.

* Mon Nov 05 2012 Ralph Bean <rbean@redhat.com> - 0.2-1
- Version bump for packaging.

* Mon Nov 05 2012 Ralph Bean <rbean@redhat.com> - 0.1-1
- Initial packaging for Fedora Infrastructure
