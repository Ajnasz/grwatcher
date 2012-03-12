#!/usr/bin/perl
use strict;

# use Data::Dumper;
use XML::DTD;
use File::Path;
use File::Copy;

my $inputDir = '../defaultlocales';
my $outputDir = '../chrome/locale';
my $refLocale = 'en-US';

my $exceptions = ['GRWpreferences.account.tab.oauth'];

my $release;

if ($ARGV[0] eq 'babelzilla') {
  $release = 0;
} elsif ($ARGV[0] eq 'release') {
  $release = 1;
} else {
  if (!$ARGV[0]) {
    print "no arguments defined\n";
  } else {
    print "wrong arguments given\n";
  }
  exit 1;
}

sub readFile {
    my $file = shift;

    my $dtd = new XML::DTD;
    open(FH,'<' . $file);
    $dtd->fread(*FH);
    close(FH);
    return $dtd;
}

sub getFileGenerals {
    my $file = shift;
    my $dtd = readFile($file);
    return $dtd->entman->{'GENERAL'};
}

sub writeFile {
    my $file = shift;
    my $content = shift;

    my $dtd = new XML::DTD;
    $dtd->sread($content);
    open(FH,'>' . $file);
    $dtd->fwrite(*FH);
    close(FH);
}

sub isException {
  my $entity = shift;
  my @grepped = grep(/^$entity/, @{$exceptions});
  return scalar(@grepped) > 0;
}

# not so beautiful, there is no method to delete an entity from a dtd, so do it manually
# first delete from the $dtd-{'ALL'} then delete from the $ref->entman->{'GENERAL'}
sub deleteEntity {
  my $ref = shift;
  my $entity = shift;
  my $validEntities = [];
  foreach my $index (0 .. $#{$ref->{'ALL'}}) {
    unless ($ref->{'ALL'}[$index]->{'NAME'} eq $entity) {
      push(@{$validEntities}, $ref->{'ALL'}[$index]);
    }
  }
  $ref->{'ALL'} = $validEntities;
  foreach my $key (keys %{$ref->entman->{'GENERAL'}}) {
    if ($key eq $entity) {
      delete $ref->entman->{'GENERAL'}->{$key};
    }
  }
}

sub keyInRefAll {
  my $ref = shift;
  my $entity = shift;
  my $output = 0;
  foreach my $index (0 .. $#{$ref->{'ALL'}}) {
    if (($ref->{'ALL'}[$index]->{'CMPNTTYPE'} eq 'entity') and ($ref->{'ALL'}[$index]->{'NAME'} eq $entity)) {
      $output = 1;
      last;
    }
  }
  return $output;
}

sub fillMissing {
  my $localeReference = shift;
  my $reference = readFile($inputDir .'/' . $refLocale . '/grwatcher.dtd');

  foreach my $key (keys %{$reference->entman->{'GENERAL'}}) {
    if (!$localeReference->entman->{'GENERAL'}->{$key}->{'ENTITYDEF'}) {
      my $ent = XML::DTD::Entity->new('<!ENTITY ' . $key .  ' "' . $reference->entman->{'GENERAL'}->{$key}->{'ENTITYDEF'} . '">' . "\n");
      push(@{$localeReference->{'ALL'}}, $ent) unless (keyInRefAll($localeReference, $key));
      $localeReference->entman->{'GENERAL'}->{$key} = $ent;
     }
  }
}

sub removeEmpty {
  my $localeReference = shift;
  my $reference = readFile($inputDir .'/' . $refLocale . '/grwatcher.dtd');

  foreach my $key (keys %{$reference->entman->{'GENERAL'}}) {
    if (!isException($key) and (!defined($localeReference->entman->{'GENERAL'}->{$key}->{'ENTITYDEF'}) || $localeReference->entman->{'GENERAL'}->{$key}->{'ENTITYDEF'} eq '')) {
      deleteEntity($localeReference, $key);
    }
  }
}

sub removeSame {
  my $localeReference = shift;
  my $reference = readFile($inputDir .'/' . $refLocale . '/grwatcher.dtd');

  foreach my $key (keys %{$reference->entman->{'GENERAL'}}) {
     if (!isException($key) and ($localeReference->entman->{'GENERAL'}->{$key}->{'ENTITYDEF'} eq $reference->entman->{'GENERAL'}->{$key}->{'ENTITYDEF'})) {
       deleteEntity($localeReference, $key);
     }
  }
}

sub parsePropertiesFile {
  my $refFile = shift;
  my $inputFile = shift;
  my $operation = shift;

  open(REFFILE, '<', $refFile);
  my @refLines = <REFFILE>;
  close(REFFILE);
  open(INPUTFILE, '<', $inputFile);
  my @inputLines = <INPUTFILE>;
  close(INPUTFILE);

  my $refKeys = {};
  my $fileKeys = {};

  # regexp because the translation may contain = char
  foreach (@refLines) {
    $_ =~ /^([\w\d]+)=(.+)$/;
    $refKeys->{$1} = $2;
  }
  foreach (@inputLines) {
    $_ =~ /^([\w\d]+)=(.+)$/;
    $fileKeys->{$1} = $2;
  }

  for (keys $refKeys) {
    if ($fileKeys->{$_} eq $refKeys->{$_}) {
      delete $fileKeys->{$_};
    }
  }

  if ($operation eq 'fix') {
    for (keys $refKeys) {
      if (!$fileKeys->{$_}) {
        $fileKeys->{$_} = $refKeys->{$_};
      }
    }
  }
  return $fileKeys;
}

sub writePropertiesFile {
  my $keys = shift;
  my $locale = shift;
  my $dir = $outputDir . '/' . $locale;

  my $output = [];
  foreach (keys $keys) {
    push(@$output, $_ . '=' . $keys->{$_});
  }

  unless (-d $dir) {
    mkpath($dir);
  }

  open(FH, '>', $dir . '/grwatcher.properties');
  print FH join("\n", @$output);
  close(FH);
}

sub writeRef {
  my $locale = shift;
  my $ref = shift;
  my $dir = $outputDir . '/' . $locale;

  unless (-d $dir) {
    mkpath($dir);
  }

  open(FH, '>', $dir . '/grwatcher.dtd');
  $ref->fwrite(*FH);
  close(FH);
}

opendir(DIR, $inputDir);
my @DIRS = readdir(DIR);
closedir(DIR);

foreach (@DIRS) {
  if ($_ ne '.' && $_ ne '..') {
    my $dir = $outputDir . '/' .$_;
    my $ref;
    my $props;
    unless (-d $dir) {
      mkpath($dir);
    }
    copy($inputDir . '/' .$_ . '/grwatcher.properties', $dir .'/grwatcher.properties');
    copy($inputDir . '/' .$_ . '/grwatcher.dtd', $dir .'/grwatcher.dtd');
    $ref = readFile($inputDir . '/' . $_ . '/grwatcher.dtd');
    if ($release) {
      if ($_ ne $refLocale) {
        removeSame($ref);
        fillMissing($ref);
        writeRef($_, $ref);
        $props = parsePropertiesFile($inputDir . '/' .$refLocale . '/grwatcher.properties', $inputDir . '/' .$_ . '/grwatcher.properties', 'fix');
        writePropertiesFile($props, $_);
      }
    } else {
      if ($_ ne $refLocale) {
        removeSame($ref);
        removeEmpty($ref);
        writeRef($_, $ref);
        $props = parsePropertiesFile($inputDir . '/' .$refLocale . '/grwatcher.properties', $inputDir . '/' .$_ . '/grwatcher.properties');
        writePropertiesFile($props, $_);
      }
    }
  }
}

exit 0;
