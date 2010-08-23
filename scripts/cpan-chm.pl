#!/usr/bin/perl
use strict;
use warnings;

use LWP::Simple qw($ua);
use URI::Escape;
use Path::Class;

print "getting 02packages.details.txt...\n";
my $res = $ua->get("http://www.cpan.org/modules/02packages.details.txt");
print "done\n";

$res->code == 200 or exit(1);
my ($meta, $packages) = split "\n\n", $res->content;

my $keyfile = file("search.cpan.org");
my $fh = $keyfile->open('w');
for my $line (split "\n", $packages) {
	my ($name, $version, $place) = split "\\s+", $line;
	# $fh->write(sprintf("%s\t%s\n", $name, "http://search.cpan.org/perldoc?". uri_escape($name)));
	$fh->write(sprintf("%s\t\n", $name));
}
$fh->close;

